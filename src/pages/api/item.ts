import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import apiConfig from '../../../config/api.config'
import { requireAccessToken, apiErrorResponse } from '../../utils/apiMiddleware'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = await requireAccessToken(res)
  if (!accessToken) return

  const { id = '' } = req.query

  res.setHeader('Cache-Control', apiConfig.cacheControlHeader)

  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid driveItem ID.' })
    return
  }

  try {
    const { data } = await axios.get(`${apiConfig.driveApi}/items/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { select: 'id,name,parentReference' },
    })
    res.status(200).json(data)
  } catch (error: unknown) {
    apiErrorResponse(res, error)
  }
}
