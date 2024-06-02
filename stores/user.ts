import type { User } from '~/types'
import { verifyToken } from '~/util/db'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const token = useLocalStorage<string | undefined>('web-oj-token', '', { initOnMounted: true })
  const userInfo = ref<User>()
  const loggedIn = computed(() => !!userInfo.value)

  onNuxtReady(() => {
    watchEffect(async () => {
      if (!token.value) {
        return
      }
      try {
        userInfo.value = await verifyToken(token.value)
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

  return {
    token,
    userInfo,
    loggedIn,
  }
})
