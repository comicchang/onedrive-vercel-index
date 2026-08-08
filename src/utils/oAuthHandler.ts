import axios from 'axios'
import crypto from 'node:crypto'

import apiConfig from '../../config/api.config'

// Just a disguise to obfuscate required tokens (including but not limited to client secret,
// access tokens, and refresh tokens), used along with the following two functions
const AES_SECRET_KEY = 'onedrive-vercel-index'

// EVP_BytesToKey — 兼容 CryptoJS 默认的 key/IV 派生（MD5-based）
function evpBytesToKey(password: string, salt: Buffer): { key: Buffer; iv: Buffer } {
  const blocks: Buffer[] = []
  let prev = Buffer.alloc(0)
  while (blocks.reduce((sum, b) => sum + b.length, 0) < 48) {
    const md5 = crypto.createHash('md5')
    if (prev.length > 0) md5.update(prev)
    md5.update(Buffer.from(password, 'utf8'))
    md5.update(salt)
    prev = md5.digest()
    blocks.push(prev)
  }
  const derived = Buffer.concat(blocks)
  return { key: derived.subarray(0, 32), iv: derived.subarray(32, 48) }
}

export function obfuscateToken(token: string): string {
  // Encrypt token with AES-256-CBC, 输出格式兼容 CryptoJS（Salted__ + salt + ciphertext）
  const salt = crypto.randomBytes(8)
  const { key, iv } = evpBytesToKey(AES_SECRET_KEY, salt)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  return Buffer.concat([Buffer.from('Salted__'), salt, encrypted]).toString('base64')
}
export function revealObfuscatedToken(obfuscated: string): string {
  // Decrypt AES-256-CBC，兼容 CryptoJS 加密的历史 token
  const buf = Buffer.from(obfuscated, 'base64')
  const salt = buf.subarray(8, 16)
  const { key, iv } = evpBytesToKey(AES_SECRET_KEY, salt)
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  const decrypted = Buffer.concat([decipher.update(buf.subarray(16)), decipher.final()])
  return decrypted.toString('utf8')
}

// Generate the Microsoft OAuth 2.0 authorization URL, used for requesting the authorisation code
export function generateAuthorisationUrl(): string {
  const { clientId, redirectUri, authApi, scope } = apiConfig
  const authUrl = authApi.replace('/token', '/authorize')

  // Construct URL parameters for OAuth2
  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('redirect_uri', redirectUri)
  params.append('response_type', 'code')
  params.append('scope', scope)
  params.append('response_mode', 'query')

  return `${authUrl}?${params.toString()}`
}

// The code returned from the Microsoft OAuth 2.0 authorization URL is a request URL with hostname
// http://localhost and URL parameter code. This function extracts the code from the request URL
export function extractAuthCodeFromRedirected(url: string): string {
  // Return empty string if the url is not the defined redirect uri
  if (!url.startsWith(apiConfig.redirectUri)) {
    return ''
  }

  // New URL search parameter
  const params = new URLSearchParams(url.split('?')[1])
  return params.get('code') ?? ''
}

// After a successful authorisation, the code returned from the Microsoft OAuth 2.0 authorization URL
// will be used to request an access token. This function requests the access token with the authorisation code
// and returns the access token and refresh token on success.
export async function requestTokenWithAuthCode(
  code: string
): Promise<
  | { expiryTime: string; accessToken: string; refreshToken: string }
  | { error: string; errorDescription: string; errorUri: string }
> {
  const { clientId, redirectUri, authApi } = apiConfig
  const clientSecret = revealObfuscatedToken(apiConfig.obfuscatedClientSecret)

  // Construct URL parameters for OAuth2
  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('redirect_uri', redirectUri)
  params.append('client_secret', clientSecret)
  params.append('code', code)
  params.append('grant_type', 'authorization_code')

  // Request access token
  return axios
    .post(authApi, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(resp => {
      const { expires_in, access_token, refresh_token } = resp.data
      return { expiryTime: expires_in, accessToken: access_token, refreshToken: refresh_token }
    })
    .catch(err => {
      const { error, error_description, error_uri } = err.response.data
      return { error, errorDescription: error_description, errorUri: error_uri }
    })
}

// Verify the identity of the user with the access token and compare it with the userPrincipalName
// in the Microsoft Graph API. If the userPrincipalName matches, proceed with token storing.
export async function getAuthPersonInfo(accessToken: string) {
  const profileApi = apiConfig.driveApi.replace('/drive', '')
  return axios.get(profileApi, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function sendTokenToServer(accessToken: string, refreshToken: string, expiryTime: string) {
  return await axios.post(
    '/api',
    {
      obfuscatedAccessToken: obfuscateToken(accessToken),
      accessTokenExpiry: parseInt(expiryTime),
      obfuscatedRefreshToken: obfuscateToken(refreshToken),
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
