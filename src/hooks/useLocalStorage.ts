import { ref, watch } from 'vue'

const getStorage = (): Storage | undefined => {
  if (typeof window === 'undefined') return undefined
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

/** Wire-safe JSON tree produced by `toJsonSafe` (parseable + tagged leaves). */
type EncodedTagged =
  | { $type: 'Date'; value: string }
  | { $type: 'BigInt'; value: string }
  | { $type: 'Map'; value: Array<[EncodedValue, EncodedValue]> }
  | { $type: 'Set'; value: EncodedValue[] }
  | { $type: 'RegExp'; source: string; flags: string }
  | { $type: 'Error'; name: string; message: string; stack?: string }
  | { $type: 'Number'; value: 'NaN' | 'Infinity' | '-Infinity' }
  | { $type: 'Undefined' }
  | { $type: 'Function' }
  | { $type: 'Symbol'; value?: string }
  | { $type: 'Circular' }
  | { $type: 'DepthLimit' }

interface EncodedPlainObject {
  [key: string]: EncodedValue
}

type EncodedValue =
  | null
  | boolean
  | number
  | string
  | EncodedValue[]
  | EncodedPlainObject
  | EncodedTagged

/** Values after `reviveTagged` (includes built-ins restored from tags). */
type DecodedValue =
  | null
  | boolean
  | number
  | string
  | undefined
  | Date
  | bigint
  | RegExp
  | Error
  | Map<DecodedValue, DecodedValue>
  | Set<DecodedValue>
  | DecodedValue[]
  | { [key: string]: DecodedValue }

const toJsonSafe = <T>(value: T, depth = 0, seen = new WeakSet<object>()): EncodedValue => {
  if (depth > 50) return { $type: 'DepthLimit' }

  if (value === undefined) return { $type: 'Undefined' }
  if (typeof value === 'bigint') return { $type: 'BigInt', value: value.toString() }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return { $type: 'Number', value: 'NaN' }
    if (value === Infinity) return { $type: 'Number', value: 'Infinity' }
    if (value === -Infinity) return { $type: 'Number', value: '-Infinity' }
    return value
  }
  if (typeof value === 'function') return { $type: 'Function' }
  if (typeof value === 'symbol')
    return { $type: 'Symbol', value: value.description ?? undefined }

  if (value === null) return null
  if (typeof value !== 'object') return value as boolean | number | string

  if (seen.has(value as object)) return { $type: 'Circular' }
  seen.add(value as object)

  if (value instanceof Date) return { $type: 'Date', value: value.toISOString() }
  if (value instanceof Map)
    return {
      $type: 'Map',
      value: Array.from(value.entries()).map(
        ([k, v]) => [toJsonSafe(k, depth + 1, seen), toJsonSafe(v, depth + 1, seen)] as [
          EncodedValue,
          EncodedValue,
        ],
      ),
    }
  if (value instanceof Set)
    return { $type: 'Set', value: Array.from(value.values()).map((v) => toJsonSafe(v, depth + 1, seen)) }
  if (value instanceof RegExp) return { $type: 'RegExp', source: value.source, flags: value.flags }
  if (value instanceof Error)
    return {
      $type: 'Error',
      name: value.name,
      message: value.message,
      stack: value.stack,
    }

  if (Array.isArray(value)) return value.map((v) => toJsonSafe(v, depth + 1, seen))

  const out: EncodedPlainObject = {}
  for (const [k, v] of Object.entries(value as Record<string, T>)) {
    out[k] = toJsonSafe(v, depth + 1, seen)
  }
  return out
}

/** Nodes coming from JSON.parse reviver may be wire or already-decoded children. */
type ParseReviverValue = EncodedValue | DecodedValue

const reviveTagged = (value: ParseReviverValue): DecodedValue => {
  if (value === null || typeof value !== 'object') {
    return value as DecodedValue
  }

  if (Array.isArray(value)) {
    return value.map((item) => reviveTagged(item as ParseReviverValue)) as DecodedValue
  }

  const obj = value as EncodedPlainObject
  if (!('$type' in obj) || typeof (obj as Record<string, unknown>).$type !== 'string') {
    return obj as DecodedValue
  }

  const getString = (key: string): string | undefined => {
    const v = (obj as Record<string, unknown>)[key]
    return typeof v === 'string' ? v : undefined
  }

  switch ((obj as EncodedTagged).$type) {
    case 'Date': {
      const raw = getString('value')
      return raw ? new Date(raw) : (obj as DecodedValue)
    }
    case 'BigInt': {
      const raw = getString('value')
      return raw ? BigInt(raw) : (obj as DecodedValue)
    }
    case 'Map': {
      const raw = obj.value
      return Array.isArray(raw)
        ? new Map(raw as Iterable<[DecodedValue, DecodedValue]>)
        : (obj as DecodedValue)
    }
    case 'Set': {
      const raw = obj.value
      return Array.isArray(raw) ? new Set(raw as DecodedValue[]) : (obj as DecodedValue)
    }
    case 'RegExp': {
      const source = getString('source')
      const flags = getString('flags')
      return source && flags ? new RegExp(source, flags) : (obj as DecodedValue)
    }
    case 'Error': {
      const message = getString('message')
      const err = new Error(message ?? 'Error')
      const name = getString('name')
      const stack = getString('stack')
      if (name) err.name = name
      if (stack) err.stack = stack
      return err
    }
    case 'Number': {
      const raw = obj.value
      if (raw === 'NaN') return NaN
      if (raw === 'Infinity') return Infinity
      if (raw === '-Infinity') return -Infinity
      return obj as DecodedValue
    }
    case 'Undefined':
      return undefined
    default:
      return obj as DecodedValue
  }
}

export const useLocalStorage = <T extends DecodedValue>(key: string, initialValue: T) => {
  const storedValue = ref(initialValue)

  const storage = getStorage()
  const storedRaw = storage?.getItem(key)
  if (storedRaw != null && storedRaw !== '') {
    try {
      const parsed = JSON.parse(storedRaw, (_k, v: ParseReviverValue) => reviveTagged(v)) as T
      if (parsed !== undefined) storedValue.value = parsed
    } catch {
      // Ignore malformed JSON / revive errors.
    }
  }

  watch(
    storedValue,
    (value) => {
      if (!storage) return
      try {
        const serialized = JSON.stringify(toJsonSafe(value))
        storage.setItem(key, serialized)
      } catch {
        // Ignore quota / privacy mode / storage errors.
      }
    },
    { deep: true },
  )

  return {
    storedValue,
  }
}
