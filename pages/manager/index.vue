<template>
  <div>
    <el-tabs class="mt-12 ml-6" tab-position="left">
      <el-tab-pane label="用户管理">
        <users />
      </el-tab-pane>
      <el-tab-pane label="题目管理">
        <!-- TODO -->
        TODO
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
  import Users from './components/users.vue'

  useHead({
    title: '系统管理',
  })

  const router = useRouter()
  const userStore = useUserStore()
  const { loggedIn, isTeacher } = storeToRefs(userStore)

  watchEffect(() => {
    if (loggedIn.value && !isTeacher.value) {
      router.replace('/')
    }
  })
</script>
