import { computed, Ref, ref, watch, watchEffect, WatchSource } from "vue"

const storage = {}
const computedStorage = {}

export function usePageStore<T>(page: string, def: () => T): T {
  if (!storage[page]) storage[page] = def()

  return storage[page]
}


export function useStorageComptuted<T>(key: string, def: () => T) {
  const t = computed(def)
  computedStorage[key] = t
  return t
}
