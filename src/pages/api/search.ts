import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { encodePath } from '.'
import apiConfig from '../../../config/api.config'
import siteConfig from '../../../config/site.config'
import { requireAccessToken, apiErrorResponse } from '../../utils/apiMiddleware'

/**
 * Sanitize the search query
 *
 * @param query User search query, which may contain special characters
 * @returns Sanitised query string, which:
 * - encodes the '<' and '>' characters,
 * - replaces '?' and '/' characters with ' ',
 * - replaces ''' with ''''
 * Reference: https://stackoverflow.com/questions/41491222/single-quote-escaping-in-microsoft-graph.
 */
function sanitiseQuery(query: string): string {
  const sanitisedQuery = query
    .replace(/'/g, "''")
    .replace('<', ' &lt; ')
    .replace('>', ' &gt; ')
    .replace('?', ' ')
    .replace('/', ' ')
  return encodeURIComponent(sanitisedQuery)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = await requireAccessToken(res)
  if (!accessToken) return

  const { q: searchQuery = '' } = req.query

  res.setHeader('Cache-Control', apiConfig.cacheControlHeader)

  if (typeof searchQuery !== 'string') {
    res.status(200).json([])
    return
  }

  const searchRootPath = encodePath('/')
  const encodedPath = searchRootPath === '' ? searchRootPath : searchRootPath + ':'
  const searchApi = `${apiConfig.driveApi}/root${encodedPath}/search(q='${sanitiseQuery(searchQuery)}')`

  try {
    const { data } = await axios.get(searchApi, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: 'id,name,file,folder,parentReference',
        top: siteConfig.maxItems,
      },
    })
    res.status(200).json(data.value)
  } catch (error: unknown) {
    apiErrorResponse(res, error)
  }
}
