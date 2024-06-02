import Dexie, { type EntityTable } from 'dexie'
import type { User } from '~/types'
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
    users: '++id, username, isDeleted',
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
