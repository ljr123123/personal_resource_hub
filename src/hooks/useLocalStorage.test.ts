import { effectScope, nextTick, type Ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

const settle = async () => {
  await nextTick()
  await flushPromises()
}

function startHook<T>(key: string, initial: T) {
  const scope = effectScope()
  const api = scope.run(() => useLocalStorage(key, initial as never))!
  return { scope, storedValue: api.storedValue as Ref<T> }
}

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses initialValue when key is absent', () => {
    const { scope, storedValue } = startHook('missing', 42)
    expect(storedValue.value).toBe(42)
    scope.stop()
  })

  it('does not treat empty string as JSON payload', () => {
    localStorage.setItem('empty', '')
    const { scope, storedValue } = startHook('empty', 'fallback')
    expect(storedValue.value).toBe('fallback')
    scope.stop()
  })

  it('ignores malformed JSON and keeps initialValue', () => {
    localStorage.setItem('bad', '{not json')
    const { scope, storedValue } = startHook('bad', { a: 1 })
    expect(storedValue.value).toEqual({ a: 1 })
    scope.stop()
  })

  it('hydrates primitives from storage', () => {
    localStorage.setItem('n', '7')
    const { scope, storedValue } = startHook('n', 0)
    expect(storedValue.value).toBe(7)
    scope.stop()
  })

  it('persists primitive updates to localStorage', async () => {
    const { scope, storedValue } = startHook('counter', 1)
    storedValue.value = 2
    await settle()
    expect(localStorage.getItem('counter')).toBe('2')
    scope.stop()
  })

  it('roundtrips Date via tagged encoding', () => {
    const iso = '2011-11-11T11:11:11.111Z'
    localStorage.setItem('d', JSON.stringify({ $type: 'Date', value: iso }))
    const { scope, storedValue } = startHook('d', new Date(0))
    expect(storedValue.value).toBeInstanceOf(Date)
    expect((storedValue.value as Date).toISOString()).toBe(iso)
    scope.stop()
  })

  it('roundtrips Map', async () => {
    const { scope, storedValue } = startHook('m', new Map<string, number>([['x', 1]]))
    storedValue.value = new Map([
      ['a', 2],
      ['b', 3],
    ])
    await settle()
    expect(localStorage.getItem('m')).toBeTruthy()

    const scope2 = effectScope()
    const { storedValue: again } = scope2.run(() => useLocalStorage('m', new Map()))!
    expect(again.value).toBeInstanceOf(Map)
    expect([...(again.value as Map<string, number>).entries()]).toEqual([
      ['a', 2],
      ['b', 3],
    ])
    scope2.stop()
    scope.stop()
  })

  it('roundtrips Set', async () => {
    const { scope, storedValue } = startHook('s', new Set<number>([1]))
    storedValue.value = new Set([9, 8])
    await settle()

    const scope2 = effectScope()
    const { storedValue: again } = scope2.run(() => useLocalStorage('s', new Set<number>()))!
    expect(again.value).toBeInstanceOf(Set)
    expect([...(again.value as Set<number>)].sort()).toEqual([8, 9])
    scope2.stop()
    scope.stop()
  })

  it('roundtrips RegExp when flags are non-empty', () => {
    localStorage.setItem(
      'rx',
      JSON.stringify({ $type: 'RegExp', source: 'ab+', flags: 'gi' }),
    )
    const { scope, storedValue } = startHook('rx', /x/m)
    expect(storedValue.value).toBeInstanceOf(RegExp)
    expect((storedValue.value as RegExp).source).toBe('ab+')
    expect((storedValue.value as RegExp).flags).toBe('gi')
    scope.stop()
  })

  it('roundtrips Error name, message, and stack', () => {
    const payload = {
      $type: 'Error',
      name: 'TypeError',
      message: 'boom',
      stack: 'stack-line',
    }
    localStorage.setItem('err', JSON.stringify(payload))
    const { scope, storedValue } = startHook('err', new Error('x'))
    expect(storedValue.value).toBeInstanceOf(Error)
    expect((storedValue.value as Error).name).toBe('TypeError')
    expect((storedValue.value as Error).message).toBe('boom')
    expect((storedValue.value as Error).stack).toBe('stack-line')
    scope.stop()
  })

  it('roundtrips NaN, Infinity, and -Infinity', () => {
    const cases: Array<{ wire: string; check: (v: number) => void }> = [
      {
        wire: JSON.stringify({ $type: 'Number', value: 'NaN' }),
        check: (v) => expect(Number.isNaN(v)).toBe(true),
      },
      {
        wire: JSON.stringify({ $type: 'Number', value: 'Infinity' }),
        check: (v) => expect(v).toBe(Infinity),
      },
      {
        wire: JSON.stringify({ $type: 'Number', value: '-Infinity' }),
        check: (v) => expect(v).toBe(-Infinity),
      },
    ]
    for (const { wire, check } of cases) {
      localStorage.setItem('num', wire)
      const { scope, storedValue } = startHook('num', 0)
      check(storedValue.value as number)
      scope.stop()
    }
  })

  it('roundtrips bigint', () => {
    localStorage.setItem('bi', JSON.stringify({ $type: 'BigInt', value: '9007199254740993' }))
    const { scope, storedValue } = startHook('bi', 0n)
    expect(typeof storedValue.value).toBe('bigint')
    expect(storedValue.value).toBe(9007199254740993n)
    scope.stop()
  })

  it('does not replace state when stored root revives to undefined', () => {
    localStorage.setItem('undef', JSON.stringify({ $type: 'Undefined' }))
    const initial = { ok: true }
    const { scope, storedValue } = startHook('undef', initial)
    expect(storedValue.value).toEqual(initial)
    scope.stop()
  })

  it('deep watch persists nested mutations', async () => {
    const { scope, storedValue } = startHook('deep', { nested: { count: 0 } })
    storedValue.value.nested.count = 5
    await settle()
    const parsed = JSON.parse(localStorage.getItem('deep') ?? '{}') as { nested: { count: number } }
    expect(parsed.nested.count).toBe(5)
    scope.stop()
  })

  it('swallows setItem errors without throwing from the update path', async () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })
    const { scope, storedValue } = startHook('q', 1)
    expect(() => {
      storedValue.value = 2
    }).not.toThrow()
    await settle()
    expect(spy).toHaveBeenCalled()
    scope.stop()
  })

  it('does not throw when localStorage getter throws (privacy / blocked access)', () => {
    const orig = Object.getOwnPropertyDescriptor(window, 'localStorage')
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked')
      },
    })
    try {
      const { scope, storedValue } = startHook('blocked', 7)
      expect(storedValue.value).toBe(7)
      scope.stop()
    } finally {
      if (orig) Object.defineProperty(window, 'localStorage', orig)
    }
  })

  it('keeps independent keys isolated', async () => {
    const scope = effectScope()
    scope.run(() => {
      const a = useLocalStorage('ka', 1 as number)
      const b = useLocalStorage('kb', 2 as number)
      a.storedValue.value = 10
      b.storedValue.value = 20
    })
    await settle()
    expect(localStorage.getItem('ka')).toBe('10')
    expect(localStorage.getItem('kb')).toBe('20')
    scope.stop()
  })

  it('serializes circular references without crashing', async () => {
    type Node = { self?: Node }
    const { scope, storedValue } = startHook<Node>('circ', {})
    const root: Node = {}
    root.self = root
    storedValue.value = root
    await settle()
    const raw = localStorage.getItem('circ')
    expect(raw).toContain('Circular')
    scope.stop()
  })
})
