import type { UserInfo } from '~/types'
import { verifyToken } from '~/util/db'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const token = useLocalStorage<string | undefined>('web-oj-token', '', { initOnMounted: true })

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
        refetchUserInfo()
      } catch (error: any) {
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

  async function refetchUserInfo() {
    if (!token.value) throw new Error('未登录')
    return (userInfo.value = await verifyToken(token.value))
  }

  return {
    token,
    userInfo,
    loggedIn,

    isStudent,
    isTeacher,

    refetchUserInfo,
  }
})
