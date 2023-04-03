import { MaybeRef } from '@vueuse/core'
import { unref, isRef } from 'vue-demi'

const isObject = (val: Record<string, any>) => val !== null && typeof val === 'object'
const isArray = Array.isArray

/**
 * Deeply unref a value, recursing into objects and arrays.
 *
 * Adapted from https://github.com/DanHulton/vue-deepunref
 */
export function deepUnref(val: MaybeRef<Record<string, any>>) {
  const checkedVal: any = isRef(val) ? unref(val) : val

  if (!isObject(checkedVal)) {
    return checkedVal
  }

  if (isArray(checkedVal)) {
    return unrefArray(checkedVal)
  }

  return unrefObject(checkedVal)
}

// Unref a value, recursing into it if it's an object.
const smartUnref = (val: Record<string, any>) => {
  // Non-ref object?  Go deeper!
  if (val !== null && !isRef(val) && typeof val === 'object') {
    return deepUnref(val)
  }

  return unref(val)
}

// Unref an array, recursively.
const unrefArray = (arr: any) => arr.map(smartUnref)

// Unref an object, recursively.
const unrefObject = (obj: Record<string, any>) => {
  const unreffed: Record<string, any> = {}

  Object.keys(obj).forEach((key) => {
    unreffed[key] = smartUnref(obj[key])
  })

  return unreffed
}
