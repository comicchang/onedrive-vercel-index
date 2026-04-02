import { useCallback, useRef } from 'react'

/**
 * 防抖回调 hook，替代 awesome-debounce-promise + use-constant
 * @param fn 要防抖的异步函数
 * @param delay 延迟毫秒数
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const fnRef = useRef(fn)
  fnRef.current = fn

  return useCallback(
    (...args: any[]) => {
      return new Promise((resolve, reject) => {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          Promise.resolve(fnRef.current(...args)).then(resolve, reject)
        }, delay)
      })
    },
    [delay]
  ) as T
}
