import type { NextApiRequest, NextApiResponse } from 'next'
import type { OutgoingHttpHeaders } from 'http'
import axios from 'axios'
import Cors from 'cors'

import { driveApi, cacheControlHeader } from '../../../config/api.config'
import { encodePath } from '.'
import { requireAccessToken, validateAndCleanPath, handleAuthRoute, apiErrorResponse } from '../../utils/apiMiddleware'

// CORS 中间件：https://nextjs.org/docs/api-routes/api-middlewares
export function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  const cors = Cors({ methods: ['GET', 'HEAD'] })
  return new Promise((resolve, reject) => {
    cors(req, res, result => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = await requireAccessToken(res)
  if (!accessToken) return

  const { path = '/', odpt = '', proxy = false } = req.query

  const cleanPath = validateAndCleanPath(path, res)
  if (!cleanPath) return

  const odTokenHeader = (req.headers['od-protected-token'] as string) ?? odpt
  const authed = await handleAuthRoute(cleanPath, accessToken, odTokenHeader, res)
  if (!authed) return

  await runCorsMiddleware(req, res)
  try {
    const requestUrl = `${driveApi}/root${encodePath(cleanPath)}`
    const { data } = await axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: 'id,size,@microsoft.graph.downloadUrl',
      },
    })

    if ('@microsoft.graph.downloadUrl' in data) {
      if (proxy && 'size' in data && data['size'] < 4194304) {
        const { headers, data: stream } = await axios.get(data['@microsoft.graph.downloadUrl'] as string, {
          responseType: 'stream',
        })
        headers['Cache-Control'] = cacheControlHeader
        res.writeHead(200, headers as unknown as OutgoingHttpHeaders)
        stream.pipe(res)
      } else {
        res.redirect(data['@microsoft.graph.downloadUrl'])
      }
    } else {
      res.status(404).json({ error: 'No download url found.' })
    }
  } catch (error: unknown) {
    apiErrorResponse(res, error)
  }
}
