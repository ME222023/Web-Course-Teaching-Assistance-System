import type { SiteConfig } from '~/types'

export const useConfigStore = defineStore('config', () => {
  const siteConfig = useLocalStorage<SiteConfig>(
    'szu-oj-site-config',
    {
      registerEnabled: true,
    },
    { initOnMounted: true },
  )

  return {
    siteConfig,
  }
})
