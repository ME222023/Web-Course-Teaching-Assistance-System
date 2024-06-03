import Dexie, { type EntityTable } from 'dexie'
import type { User, UserInfo, UserRole } from '~/types'
import { encryptPassword, generateSalt, verifyPassword } from './crypto'
import { parseToken, signToken } from './jwt'

/** 初始化数据库实例，并用 TypeScript 类型设置好表的结构，方面开发 */
const db = new Dexie('weboj-db') as Dexie & {
  users: EntityTable<User, 'id'>
}

// 初始化数据库，在下方每个函数中都要调用
function initDatabase() {
  if (db.isOpen()) return
  /**
   * 初始化数据库的索引结构。Dexie 只需要初始化索引字段即可，不需要定义表结构（只用设置 TypeScript 类型，在上面）。
   * https://dexie.org/docs/Version/Version.stores()#indexable-types
   */
  db.version(1).stores({
    users: '++id, username, nickname, isDeleted, role, [id+isDeleted], isDisabled',
  })
}

export async function login(username: string, password: string) {
  initDatabase()
  const user = await db.users.where({ username, isDeleted: 0 }).first()

  if (!user) throw new Error('用户名或密码错误')

  if (!(await verifyPassword(user.passwordSalt, password, user.password))) {
    throw new Error('用户名或密码错误')
  }
  if (user.isDisabled) throw new Error('用户已被禁用，请联系管理员')

  return signToken(user.id, user.version)
}

export async function register(username: string, password: string) {
  initDatabase()
  const config = useConfigStore()

  if (!config.siteConfig.registerEnabled) throw new Error('注册功能已关闭')

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
    isDisabled: 0,
    version: 0,
    // 第一个注册的用户自动成为老师
    role: currentUsers ? 'student' : 'teacher',
    createdAt: Date.now(),
  })

  return signToken(userId, 0)
}

async function getUser(userId: number) {
  const user = await db.users.where({ id: userId, isDeleted: 0 }).first()
  if (!user) throw new Error('用户不存在')
  return user
}

export async function verifyToken(token: string) {
  const payload = await parseToken(token)
  initDatabase()
  const user = await getUser(payload.userId)
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
  const user = await getUser(userId)

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
  role?: UserRole
}

export async function listUser(
  options?: ListUserOptions,
): Promise<{ total: number; users: UserInfo[] }> {
  initDatabase()
  let { page = 1, pageSize = 10, keyword, role } = options || {}
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
  if (role) {
    query.and((u) => u.role === role)
  }
  const total = await query.count()
  const users = await query.offset(offset).limit(pageSize).toArray()

  return { total, users }
}

export async function disableUser(userId: number) {
  initDatabase()
  const count = await db.users.where({ id: userId, isDeleted: 0 }).modify({ isDisabled: 1 })

  if (!count) throw new Error('用户不存在')
}

export async function enableUser(userId: number) {
  initDatabase()
  const count = await db.users.where({ id: userId, isDeleted: 0 }).modify({ isDisabled: 0 })

  if (!count) throw new Error('用户不存在')
}

export async function deleteUser(userId: number) {
  initDatabase()
  const count = await db.users.where({ id: userId, isDeleted: 0 }).modify({ isDeleted: 1 })

  if (!count) throw new Error('用户不存在')
}

/** 重置用户的密码为用户名。在实际中应限制只有教师可以调用 */
export async function resetPassword(userId: number) {
  initDatabase()
  const user = await db.users.where({ id: userId }).first()

  if (!user) throw new Error('用户不存在')

  const salt = await generateSalt()
  const newPassword = user.username
  const encryptedPassword = await encryptPassword(newPassword, salt)

  await db.users
    .where({ id: userId })
    .modify({ password: encryptedPassword, passwordSalt: salt, version: user.version + 1 })

  return newPassword
}
