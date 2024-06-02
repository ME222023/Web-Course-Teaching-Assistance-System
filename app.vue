<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
  useColorMode().preference = 'light'
  useHead({
    titleTemplate(title) {
      return title ? `${title} - SZU Web OJ` : 'SZU Web OJ'
    },
  })
</script>
