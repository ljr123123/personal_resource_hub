# Reflection

## Bug Fixes

- Bug(s) fixed:
  - Search behavior was missing: typing in the search input did not affect the resource list. Implemented search filtering that matches against both resource titles and tags, and composes with the active category filter.
  - Empty state was missing: when filtering results to zero items, the UI still rendered an empty grid with no user guidance. Added an empty state with clear actions to reset search and filters.
  - Category selection did not update the list reliably because the sidebar category buttons did not explicitly set `type="button"`. In some contexts this can behave like a submit button and reset UI state, making it look like the category change was ignored. Fixed by setting `type="button"` on category buttons so selecting a category consistently updates the filtered list.
  - Type safety gaps blocked correct filtering: `ResourceItem` was missing `tags`/`addedAt` even though the UI and mock data depend on them. Completed the type to match actual data usage.
  - LocalStorage persistence could break on non-JSON-safe values and malformed stored data. Improved `useLocalStorage` with safe parsing/serialization: it no longer crashes when localStorage is unavailable (privacy mode/SSR), when stored JSON is corrupted, or when values contain circular references / `BigInt` / `NaN` / `Infinity`. Common complex types (`Date`, `Map`, `Set`, `RegExp`, `Error`) are encoded with type tags and revived on read.
  - TypeScript modeling for LocalStorage was tightened further: `unknown` was removed from the hook implementation in favor of explicit recursive unions (`EncodedValue` for serialized wire format, `DecodedValue` for post-revive values) and generic entry points (`toJsonSafe<T>`, `safeJsonParse<T extends DecodedValue>`, `useLocalStorage<T extends DecodedValue>`). JSON `reviver` inputs are typed as `EncodedValue | DecodedValue` so nested nodes stay type-safe without `any` / `unknown`, while preserving the same runtime behavior (tagged encoding, bounded depth, circular detection).

## Performance Improvements

- Changes made:
  - Reduced unnecessary work in filtering by normalizing the search query once (`trim().toLowerCase()`) and short-circuiting early when the query is empty.
  - Filter is now a single computed pipeline (category first, then search), keeping work proportional to the active dataset and leveraging Vue computed caching.
  - Added a bounded, JSON-safe conversion layer for LocalStorage writes: circular references are detected (no infinite recursion) and a depth limit prevents worst-case deep object traversal from freezing the UI.

- Tradeoffs:
  - Search uses simple substring matching (case-insensitive) for predictability and low overhead; it does not include fuzzy matching or ranking, which could improve relevance but would add complexity and runtime cost.
  - LocalStorage serialization favors resilience over perfect fidelity: functions and symbols are stored as tagged placeholders (not revived), and values that exceed depth limits or include cycles are replaced with sentinel tags. This keeps persistence stable and predictable, at the cost of losing some information for highly complex objects.
