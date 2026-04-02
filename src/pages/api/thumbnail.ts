import type { OdThumbnail } from '../../types'

import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { encodePath } from '.'
import apiConfig from '../../../config/api.config'
import { requireAccessToken, validateAndCleanPath, handleAuthRoute, apiErrorResponse } from '../../utils/apiMiddleware'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = await requireAccessToken(res)
  if (!accessToken) return

  const { path = '', size = 'medium', odpt = '' } = req.query

  if (odpt === '') res.setHeader('Cache-Control', apiConfig.cacheControlHeader)

  if (size !== 'large' && size !== 'medium' && size !== 'small') {
    res.status(400).json({ error: 'Invalid size' })
    return
  }

  const cleanPath = validateAndCleanPath(path, res)
  if (!cleanPath) return

  const authed = await handleAuthRoute(cleanPath, accessToken, odpt as string, res)
  if (!authed) return

  const requestPath = encodePath(cleanPath)
  const requestUrl = `${apiConfig.driveApi}/root${requestPath}`
  const isRoot = requestPath === ''

  try {
    const { data } = await axios.get(`${requestUrl}${isRoot ? '' : ':'}/thumbnails`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const thumbnailUrl = data.value && data.value.length > 0 ? (data.value[0] as OdThumbnail)[size].url : null
    if (thumbnailUrl) {
      res.redirect(thumbnailUrl)
    } else {
      res.status(400).json({ error: "The item doesn't have a valid thumbnail." })
    }
  } catch (error: unknown) {
    apiErrorResponse(res, error)
  }
}
