import { type LoginFailRecord, type UserInfo } from '~/types'
import { verifyToken } from '~/util/db'
import { handleError } from '~/util/error_parser'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const token = useLocalStorage<string | undefined>('web-oj-token', '', { initOnMounted: true })
  const loginFailRecords = useLocalStorage<LoginFailRecord[]>('web-oj-login-fail-records', [], {
    initOnMounted: true,
  })

  const userInfo = ref<UserInfo>()
  const loggedIn = computed(() => !!userInfo.value)
  const isStudent = computed(() => userInfo.value?.role === 'student')
  const isTeacher = computed(() => userInfo.value?.role === 'teacher')

  onNuxtReady(() => {
    watchEffect(async () => {
      if (!token.value) {
        return
      }
      try {
        await userInfoLoaded()
      } catch (error: any) {
        handleError('获取用户信息', error)
        token.value = undefined
        userInfo.value = undefined
        if (
          router.currentRoute.value.path !== '/login' &&
          router.currentRoute.value.path !== '/register'
        ) {
          ElMessage.error(error.message)
          router.replace('/login')
        }
      }
    })
  })

  /** 获取用户信息。假如未登录，返回 undefined */
  async function userInfoLoaded() {
    if (!token.value) return
    return userInfo.value || (userInfo.value = await verifyToken(token.value))
  }

  async function refetchUserInfo() {
    if (!token.value) throw new Error('未登录')
    return (userInfo.value = await verifyToken(token.value))
  }

  return {
    token,
    userInfo,
    loggedIn,

    loginFailRecords,

    isStudent,
    isTeacher,

    refetchUserInfo,
    userInfoLoaded,
  }
})
