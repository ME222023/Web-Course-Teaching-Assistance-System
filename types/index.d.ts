/** 数据的创建时间全部使用精确到毫秒的时间戳。 */
export type Timestamp = number

export interface User {
  id: number
  /** 用户名。学生使用学号，教师使用工号。 */
  username: string
  /** 密码的 salt */
  passwordSalt: string
  /** 加盐哈希后的密码。 */
  password: string
  /** 用户的身份，目前支持学生或老师 */
  role: 'student' | 'teacher'
  createdAt: Timestamp
  /** 用户的昵称 */
  nickname?: string
  /** 头像链接 */
  avatarUrl?: string
  /** 个人简介 */
  bio?: string
  isDeleted: boolean
}

export interface ExerciseMedia {
  type: 'image' | 'video'
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
  media: ExerciseMedia[]
  /** 题目是否已被发布。学生默认只能看到已发布的内容。 */
  published: boolean
  isDeleted: boolean
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
}
