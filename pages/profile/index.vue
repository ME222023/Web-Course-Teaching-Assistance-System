<template>
  <div>
    <el-tabs class="mt-12 ml-6" tab-position="left">
      <el-tab-pane label="实验完成情况">
        <list />
      </el-tab-pane>
      <el-tab-pane label="个人资料">
        <edit-profile />
      </el-tab-pane>
      <el-tab-pane label="修改密码">
        <edit-password />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
  import EditProfile from './components/edit-profile.vue'
  import EditPassword from './components/edit-password.vue'
  import List from './components/list.vue'

  useHead({
    title: '个人中心',
  })
</script>
