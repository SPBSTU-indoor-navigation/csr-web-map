import { Ref, ref } from "vue"

const storage = {}

export function usePageStore<T>(page: string, name: string, value: T): Ref<T> {
  if (storage[page]?.[name]) {
    return storage[page][name]
  } else {
    if (!storage[page]) storage[page] = {}
    storage[page][name] = ref(value)
  }
}
