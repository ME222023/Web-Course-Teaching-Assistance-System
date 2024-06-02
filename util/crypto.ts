import { CRYPTO_IV } from '~/constants'

/** 生成随机 salt 字符串 */
export async function generateSalt(): Promise<string> {
  const array = new Uint8Array(16)
  window.crypto.getRandomValues(array)
  const salt = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return salt
}

/** 使用 salt 和 password 进行 AES 加密 */
export async function encryptPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  )
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 1000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
  const encryptedPassword = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: CRYPTO_IV,
    },
    key,
    encoder.encode(password),
  )
  return new Uint8Array(encryptedPassword).join('')
}

/** 验证密码是否正确 */
export async function verifyPassword(
  salt: string,
  password: string,
  encryptedPassword: string,
): Promise<boolean> {
  try {
    const decryptedPassword = await encryptPassword(password, salt)
    return decryptedPassword === encryptedPassword
  } catch {
    return false
  }
}
