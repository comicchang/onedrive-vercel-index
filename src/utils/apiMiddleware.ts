import { posix as pathPosix } from 'path'
import type { NextApiResponse } from 'next'
import { getAccessToken, checkAuthRoute } from '../pages/api'

/**
 * 获取访问令牌，无令牌时返回 403
 * @returns 访问令牌，或 null（已发送错误响应）
 */
export async function requireAccessToken(res: NextApiResponse): Promise<string | null> {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    res.status(403).json({ error: 'No access token.' })
    return null
  }
  return accessToken
}

/**
 * 验证并规范化路径参数
 * @returns 清理后的路径，或 null（已发送错误响应）
 */
export function validateAndCleanPath(path: string | string[] | undefined, res: NextApiResponse): string | null {
  if (path === '[...path]') {
    res.status(400).json({ error: 'No path specified.' })
    return null
  }
  if (typeof path !== 'string') {
    res.status(400).json({ error: 'Path query invalid.' })
    return null
  }
  return pathPosix.resolve('/', pathPosix.normalize(path))
}

/**
 * 检查受保护路由的认证状态，并设置缓存头
 * @returns true 表示认证通过，false 表示已发送错误响应
 */
export async function handleAuthRoute(
  cleanPath: string,
  accessToken: string,
  odTokenHeader: string,
  res: NextApiResponse
): Promise<boolean> {
  const { code, message } = await checkAuthRoute(cleanPath, accessToken, odTokenHeader)
  if (code !== 200) {
    res.status(code).json({ error: message })
    return false
  }
  // 受保护路由不允许缓存
  if (message !== '') {
    res.setHeader('Cache-Control', 'no-cache')
  }
  return true
}

/**
 * 统一的 API 错误响应处理
 */
export function apiErrorResponse(res: NextApiResponse, error: any): void {
  res.status(error?.response?.status ?? 500).json({ error: error?.response?.data ?? 'Internal server error.' })
}
