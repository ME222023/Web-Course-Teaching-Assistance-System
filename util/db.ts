import Dexie, { type EntityTable } from 'dexie'
import type { Exercise, User, UserInfo, UserRole, Solution, Announcement } from '~/types'
import { encryptPassword, generateSalt, verifyPassword } from './crypto'
import { parseToken, signToken } from './jwt'
import dayjs from './dayjs'

/** 初始化数据库实例，并用 TypeScript 类型设置好表的结构，方面开发 */
const db = new Dexie('weboj-db') as Dexie & {
  users: EntityTable<User, 'id'>
  exercises: EntityTable<Exercise, 'id'>
  solutions: EntityTable<Solution, 'id'>
  announcements: EntityTable<Announcement, 'id'>
}

/**
 * 初始化数据库的索引结构。Dexie 只需要初始化索引字段即可，不需要定义表结构（只用设置 TypeScript 类型，在上面）。
 * https://dexie.org/docs/Version/Version.stores()#indexable-types
 */
db.version(1).stores({
  users: '++id, username, nickname, isDeleted, role, [id+isDeleted], isDisabled',
  exercises: '++id, title, creatorId, createdAt, updatedAt, isPublished, isDeleted',
  solutions:
    '++id, exerciseId, creatorId, content, language, createdAt, imageUrls, status, isDeleted',
  announcements: '++id, creatorId, createdAt, isDeleted, title',
})

export async function login(username: string, password: string) {
  const userStore = useUserStore()
  const now = dayjs()

  // 连续失败 5 次，5 分钟内禁止登录
  const failRecords = userStore.loginFailRecords.filter((r) => r.username === username)
  const last5FailRecords = failRecords.slice(-5)

  if (last5FailRecords.length === 5) {
    const firstFailTime = last5FailRecords[0].timestamp
    if (now.valueOf() - firstFailTime < 5 * 60 * 1000) {
      throw new Error(`错误次数过多，请 ${dayjs(firstFailTime).add(5, 'm').to(now, true)}后再试`)
    } else {
      // 清空失败记录
      userStore.loginFailRecords = userStore.loginFailRecords.filter((r) => r.username !== username)
    }
  }
  const user = await db.users.where({ username, isDeleted: 0 }).first()

  if (!user) throw new Error('用户名或密码错误')

  if (!(await verifyPassword(user.passwordSalt, password, user.password))) {
    userStore.loginFailRecords.push({ username, timestamp: now.valueOf() })
    throw new Error('用户名或密码错误')
  }
  if (user.isDisabled) throw new Error('用户已被禁用，请联系管理员')

  userStore.loginFailRecords = userStore.loginFailRecords.filter((r) => r.username !== username)

  return signToken(user.id, user.version)
}

export async function register(username: string, password: string) {
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

export async function getUser(userId: number) {
  const user = await db.users.where({ id: userId, isDeleted: 0 }).first()
  if (!user) throw new Error(`用户不存在: ${userId}`)
  return user
}

export async function verifyToken(token: string) {
  const payload = await parseToken(token)

  const user = await getUser(payload.userId)
  if (user.version !== payload.version) throw new Error('Token 已过期')

  return user
}

/** 更新用户信息 */
export async function updateUserInfo(userId: number, updates: Partial<UserInfo>) {
  const count = await db.users.where({ id: userId }).modify(updates)

  if (!count) throw new Error('用户不存在')
}

/** 修改密码。修改成功后，原来的 token 会失效，需要用本函数返回的 token 替换掉原有的 */
export async function changePassword(userId: number, oldPassword: string, newPassword: string) {
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
  const count = await db.users.where({ id: userId, isDeleted: 0 }).modify({ isDisabled: 1 })

  if (!count) throw new Error('用户不存在')
}

export async function enableUser(userId: number) {
  const count = await db.users.where({ id: userId, isDeleted: 0 }).modify({ isDisabled: 0 })

  if (!count) throw new Error('用户不存在')
}

export async function deleteUser(userId: number) {
  const count = await db.users.where({ id: userId, isDeleted: 0 }).modify({ isDeleted: 1 })

  if (!count) throw new Error('用户不存在')
}

/** 重置用户的密码为用户名。在实际中应限制只有教师可以调用 */
export async function resetPassword(userId: number) {
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

export async function addSolution(solution: Solution) {
  // console.log(Solution)
  await db.solutions.add({
    exerciseId: solution.exerciseId,
    creatorId: solution.creatorId,
    content: solution.content,
    language: solution.language,
    createdAt: Date.now(),
    imageUrls: solution.imageUrls,
    status: solution.status,
    isDeleted: 0,
  })
}
//查询id为number的题目
export async function getExerciseById(exerciseId: number) {
  return db.exercises.where({ id: exerciseId }).first()
}

export async function getSolutionById(solutionId: number) {
  return db.solutions.where({ id: solutionId }).first()
}

export async function listSolution(filter?: { userId?: number; exerciseId?: number }) {
  const query = db.solutions.where({ isDeleted: 0 })

  if (filter) {
    if (filter.userId) {
      query.and((x) => x.creatorId === filter.userId)
    }
    if (filter.exerciseId) {
      query.and((x) => x.exerciseId === filter.exerciseId)
    }
  }

  return query.toArray()
}

export async function getSolutionByExerciseId(exerciseId: number, creatorId?: number) {
  const filter: Partial<Solution> = { exerciseId, isDeleted: 0 }
  if (creatorId) {
    filter.creatorId = creatorId
  }
  return db.solutions.where(filter).first()
}

export async function isSubmitted(exerciseId: number, userId: number) {
  const solution = await db.solutions.where({ exerciseId, creatorId: userId }).first()
  if (solution) {
    return true
  }
  return false
}

export async function addAnnouncement(data: Omit<Announcement, 'id' | 'createdAt' | 'isDeleted'>) {
  await db.announcements.add({ ...data, createdAt: Date.now(), isDeleted: 0 })
}

export async function listAnnouncement(filter?: { keyword?: string }) {
  const query = db.announcements.where({ isDeleted: 0 })

  if (filter?.keyword) {
    query.and((a) => a.title.includes(filter.keyword!))
  }

  return await query.reverse().sortBy('createdAt')
}

export async function editAnnouncement(data: Partial<Omit<Announcement, 'id'>> & { id: number }) {
  return db.announcements.update(data.id, data)
}

export async function deleteAnnouncement(id: number) {
  const flag = await db.announcements.where({ id, isDeleted: 0 }).modify({ isDeleted: 1 })
  if (!flag) throw new Error('此公告不存在')
}

export async function editExercises(data: Partial<Omit<Exercise, 'id'>> & { id: number }) {
  // 深度克隆数据，移除不可克隆的对象
  const cleanData = JSON.parse(JSON.stringify(data))
  console.dir(cleanData)
  return db.exercises.update(cleanData.id, cleanData)
}

export async function deleteExercises(id: number) {
  const flag = await db.exercises.where({ id, isDeleted: 0 }).modify({ isDeleted: 1 })
  if (!flag) throw new Error('此实验不存在')
}

export async function withdrawExercises(id: number) {
  const flag = await db.exercises.where({ id, isPublished: 1 }).modify({ isPublished: 0 })
}

export async function repostExercises(id: number) {
  const flag = await db.exercises.where({ id, isPublished: 0 }).modify({ isPublished: 1 })
}

export async function listExercises(filter?: {
  keyword?: string
  isPublished?: boolean
  /** 是否从新到旧 */
  descending?: boolean
}) {
  const query = db.exercises.where({ isDeleted: 0 })

  if (filter) {
    if (filter.keyword) query.and((a) => a.title.includes(filter.keyword!))
    if (filter.isPublished !== undefined) {
      query.and((a) => a.isPublished === Number(filter.isPublished))
    }
    if (filter.descending) query.reverse()
  }

  return query.sortBy('createdAt')
}

export async function addExercise(
  data: Omit<Exercise, 'id' | 'updatedAt' | 'createdAt' | 'isDeleted'>,
) {
  await db.exercises.add({
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDeleted: 0,
  })
}
