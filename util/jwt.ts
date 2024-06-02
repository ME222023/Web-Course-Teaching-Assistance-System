import * as jose from 'jose'
import { JWT_SECRET } from '~/constants'

export async function signToken(userId: number, version: number): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  const alg = 'HS256'

  const token = await new jose.SignJWT({ userId, version })
    .setProtectedHeader({ alg })
    .setExpirationTime('1w')
    .sign(secret)

  return token
}

export async function parseToken(token: string): Promise<{ userId: number; version: number }> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })

    const { userId, version } = payload as { userId: number; version: number }
    return { userId, version }
  } catch (e) {
    if (e instanceof jose.errors.JWTExpired) {
      throw new Error('Token 已过期')
    }
    throw new Error('Token 解析失败')
  }
}
