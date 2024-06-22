<template>
  <el-config-provider :locale="zhCn">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </el-config-provider>
</template>

<script setup lang="ts">
  import { zhCn } from 'element-plus/es/locale/index.mjs'

  useColorMode().preference = 'light'
  useHead({
    titleTemplate(title) {
      return title ? `${title} - SZU Web OJ` : 'SZU Web OJ'
    },
  })

  onMounted(() => {
    console.log('App mounted')
  })
  onUnmounted(() => {
    console.log('App unmounted')
  })
</script>
