import { useRouter } from 'next/router'
import { getStoredToken } from './protectedRouteHandler'

/**
 * 构建带认证 token 的 raw 文件 URL
 * 统一处理预览组件中重复的 token + URL 构建逻辑
 */
export function useRawUrl() {
  const { asPath } = useRouter()
  const hashedToken = getStoredToken(asPath)

  /** 构建 /api/raw/ URL，可选自定义路径 */
  const rawUrl = (path?: string) =>
    `/api/raw/?path=${path ?? asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`

  return { asPath, hashedToken, rawUrl }
}
