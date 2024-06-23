<template>
  <client-only>
    <el-menu
      mode="horizontal"
      :ellipsis="false"
      router
      :default-active="router.currentRoute.value.path"
    >
      <el-menu-item index="/">
        <h2> SZU Web OJ </h2>
      </el-menu-item>
      <el-menu-item index="/exercise">
        <el-icon><el-icon-finished></el-icon-finished></el-icon>
        题目列表
      </el-menu-item>
      <div class="flex-grow"></div>
      <el-sub-menu v-if="loggedIn" index="1">
        <template #title>
          <div class="flex items-center" @click="$router.push('/profile')">
            <el-avatar
              :src="userInfo?.avatar"
              :icon="ElIconUser"
              shape="circle"
              class="mr-2 !w-8 !h-8"
            />
            {{ userInfo?.nickname || userInfo?.username }}
          </div>
        </template>
        <el-menu-item @click="$router.push('/profile')">个人中心</el-menu-item>
        <el-menu-item v-if="isTeacher" @click="$router.push('/manager')"> 系统管理 </el-menu-item>
        <el-menu-item @click="onClickLogout">退出登录</el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else @click="$router.push('/login')">登录</el-menu-item>
    </el-menu>
    <slot></slot>
  </client-only>
</template>

<script setup lang="ts">
  const { userInfo, token, loggedIn, isTeacher } = storeToRefs(useUserStore())
  const router = useRouter()

  async function onClickLogout() {
    // 这里等路由变化完成再清除 token，避免在 stores 中重复触发登录提醒
    await router.push('/login')
    token.value = undefined
    userInfo.value = undefined
    ElMessage.success('已退出登录')
  }
</script>
