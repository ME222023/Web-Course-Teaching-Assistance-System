/** 数据的创建时间全部使用精确到毫秒的时间戳。 */
export type Timestamp = number
/** Dexie 不支持使用 boolean 作为索引，所以这里使用 number。`1` 代表已删除，`0` 代表 */
export type IsDeletedFlag = number
export type IsDisabledFlag = number

export type UserRole = 'student' | 'teacher'

export interface User {
  id: number
  /** 用户名。学生使用学号，教师使用工号。 */
  username: string
  /** 密码的 salt */
  passwordSalt: string
  /** 加盐哈希后的密码。 */
  password: string
  /** 用户的身份，目前支持学生或老师 */
  role: UserRole
  createdAt: Timestamp
  /** 用户的昵称 */
  nickname?: string
  /** 头像链接 */
  avatar?: string
  /** 个人简介 */
  bio?: string
  /** 用户是否被删除。 */
  isDeleted: IsDeletedFlag
  /** 用户是否被禁用。禁用后无法登录。 */
  isDisabled: IsDisabledFlag
  version: number
}

export type UserInfo = Pick<
  User,
  'id' | 'username' | 'role' | 'nickname' | 'avatar' | 'bio' | 'isDisabled'
>

export interface ExerciseMedia {
  type: 'image' | 'video' | 'audio'
  url: string
}

export interface Exercise {
  id: number
  /** 题目的标题 */
  title: string
  /** 题目的内容 */
  content: string
  /** 题目的创建者 ID */
  creatorId: number
  /** 题目的创建时间 */
  createdAt: Timestamp
  /** 题目的更新时间 */
  updatedAt: Timestamp
  images?: string[]
  audios?: string[]
  videos?: string[]
  /** 题目是否已被发布。学生默认只能看到已发布的内容。 */
  isPublished: number
  isDeleted: IsDeletedFlag
}

export enum SolutionStatus {
  Pending = 'pending',
  Accepted = 'AC',
  WrongAnswer = 'WA',
  TimeLimitExceeded = 'TLE',
  MemoryLimitExceeded = 'MLE',
  RuntimeError = 'RE',
  CompilationError = 'CE',
}

/** 由学生提交的实验解法（代码） */
export interface Solution {
  id: number
  /** 实验的 ID */
  exerciseId: number
  /** 学生的 ID */
  creatorId: number
  /** 代码 */
  content: string
  /** 代码语言，可以用来设置语法高亮。定好语法高亮库后可以考虑改成枚举 */
  language: string
  createdAt: Timestamp
  imageUrls: string[]
  /** 提交状态，默认为 {@link SolutionStatus.Pending} */
  status: SolutionStatus
  isDeleted: IsDeletedFlag
}

/** 站点设置 */
export interface SiteConfig {
  /** 是否启用注册，默认 `true` */
  registerEnabled: boolean
}

export interface LoginFailRecord {
  username: string
  timestamp: Timestamp
}

/** 站点公告 */
export interface Announcement {
  id: number
  creatorId: number
  createdAt: Timestamp
  title: string
  content: string
  isDeleted: IsDeletedFlag
}
