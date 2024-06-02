import Dexie, { type EntityTable } from 'dexie'
import type { User, UserInfo } from '~/types'
import { encryptPassword, generateSalt, verifyPassword } from './crypto'
import { parseToken, signToken } from './jwt'

const db = new Dexie('weboj-db') as Dexie & {
  users: EntityTable<User, 'id'>
}

// 初始化数据库，在下方每个函数中都要调用
function initDatabase() {
  if (db.isOpen()) return
  // https://dexie.org/docs/Version/Version.stores()#indexable-types
  db.version(1).stores({
    users: '++id, username, nickname, isDeleted, role, [id+isDeleted]',
  })
}

export async function login(username: string, password: string) {
  initDatabase()
  const user = await db.users.where({ username, isDeleted: 0 }).first()

  if (!user) throw new Error('用户名或密码错误')

  if (!(await verifyPassword(user.passwordSalt, password, user.password))) {
    throw new Error('用户名或密码错误')
  }

  return signToken(user.id, user.version)
}

export async function register(username: string, password: string) {
  initDatabase()
  const user = await db.users.where({ username, isDeleted: 0 }).first()

  if (user) throw new Error('用户名已存在')

  const salt = await generateSalt()
  const encryptedPassword = await encryptPassword(password, salt)
  const currentUsers = await db.users.where({ isDeleted: 0 }).count()

  const userId = await db.users.add({
    username,
    password: encryptedPassword,
    passwordSalt: salt,
    isDeleted: 0,
    version: 0,
    // 第一个注册的用户自动成为老师
    role: currentUsers ? 'student' : 'teacher',
    createdAt: Date.now(),
  })

  return signToken(userId, 0)
}

export async function verifyToken(token: string) {
  const payload = await parseToken(token)
  initDatabase()
  const user = await db.users.where({ id: payload.userId, isDeleted: 0 }).first()

  if (!user) throw new Error('用户不存在')
  if (user.version !== payload.version) throw new Error('Token 已过期')

  return user
}

/** 更新用户信息 */
export async function updateUserInfo(userId: number, updates: Partial<UserInfo>) {
  initDatabase()
  const count = await db.users.where({ id: userId }).modify(updates)

  if (!count) throw new Error('用户不存在')
}

/** 修改密码。修改成功后，原来的 token 会失效，需要用本函数返回的 token 替换掉原有的 */
export async function changePassword(userId: number, oldPassword: string, newPassword: string) {
  initDatabase()
  const user = await db.users.where({ id: userId, isDeleted: 0 }).first()

  if (!user) throw new Error('用户不存在')
  if (!(await verifyPassword(user.passwordSalt, oldPassword, user.password))) {
    throw new Error('旧密码错误')
  }

  const salt = await generateSalt()
  const encryptedPassword = await encryptPassword(newPassword, salt)

  await db.users
    .where({ id: userId })
    .modify({ password: encryptedPassword, passwordSalt: salt, version: user.version + 1 })

  return signToken(userId, user.version + 1)
}

export interface ListUserOptions {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页的数量 */
  pageSize?: number
  /** 用户名关键词 */
  keyword?: string
}

export async function listUser(
  options?: ListUserOptions,
): Promise<{ total: number; users: UserInfo[] }> {
  initDatabase()
  let { page = 1, pageSize = 10, keyword } = options || {}
  const offset = (page - 1) * pageSize
  if (keyword) keyword = keyword.trim().toLowerCase()
  const query = db.users.where({ isDeleted: 0 })
  if (keyword) {
    query.and(
      (user) =>
        user.username.toLowerCase().includes(keyword) ||
        !!user.nickname?.toLowerCase().includes(keyword),
    )
  }
  const total = await query.count()
  const users = await query.offset(offset).limit(pageSize).toArray()

  return { total, users }
}
