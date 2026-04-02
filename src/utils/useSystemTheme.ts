import { useEffect, useState } from 'react'

/**
 * 系统主题检测 hook，替代 react-use-system-theme 包
 * @param fallback 无法检测时的回退值
 */
export default function useSystemTheme(fallback: 'dark' | 'light' = 'dark'): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>(fallback)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setTheme(mq.matches ? 'dark' : 'light')

    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return theme
}
