import { useCallback, useRef, useState } from 'react'

/**
 * 剪贴板复制 hook，替代 use-clipboard-copy 包
 * @param copiedTimeout 复制成功状态持续时间（毫秒），默认不自动重置
 */
export function useClipboard({ copiedTimeout }: { copiedTimeout?: number } = {}) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        if (copiedTimeout) {
          clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => setCopied(false), copiedTimeout)
        }
      })
    },
    [copiedTimeout]
  )

  return { copy, copied }
}
