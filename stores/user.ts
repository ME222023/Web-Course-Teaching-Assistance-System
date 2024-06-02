import type { User } from '~/types'
import { verifyToken } from '~/util/db'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const token = useLocalStorage<string | undefined>('web-oj-token', '', { initOnMounted: true })
  const userInfo = ref<User>()

  onNuxtReady(() => {
    function logout() {
      userInfo.value = undefined
      if (
        router.currentRoute.value.path !== '/login' &&
        router.currentRoute.value.path !== '/register'
      ) {
        ElMessage.error('请先登录')
        router.replace('/login')
      }
    }
    watchEffect(async () => {
      if (!token.value) {
        return logout()
      }
      try {
        userInfo.value = await verifyToken(token.value)
      } catch (error) {
        token.value = undefined
        return logout()
      }
    })
  })

  return {
    token,
    userInfo,
  }
})
