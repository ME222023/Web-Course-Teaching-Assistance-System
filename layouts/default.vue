<template>
  <div>
    <el-menu mode="horizontal" :ellipsis="false">
      <el-menu-item @click="$router.push('/')">
        <h2> SZU Web OJ </h2>
      </el-menu-item>
      <div class="flex-grow"></div>
      <el-sub-menu index="1">
        <template #title>{{ userInfo?.nickname || userInfo?.username }}</template>
        <el-menu-item index="1-1" @click="onClickLogout">退出登录</el-menu-item>
      </el-sub-menu>
    </el-menu>
    <slot></slot>
    2
  </div>
</template>

<script setup lang="ts">
  const { userInfo, token } = storeToRefs(useUserStore())
  const router = useRouter()

  async function onClickLogout() {
    // 这里等路由变化完成再清除 token，避免在 stores 中重复触发登录提醒
    await router.push('/login')
    token.value = undefined
    ElMessage.success('已退出登录')
  }
</script>
