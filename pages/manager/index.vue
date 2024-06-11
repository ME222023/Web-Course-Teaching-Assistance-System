<template>
  <div>
    <el-tabs class="mt-12 ml-6" tab-position="left">
      <el-tab-pane label="用户管理">
        <users />
      </el-tab-pane>
      <el-tab-pane label="实验发布">
        <exp-publish />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import Users from './components/users.vue';
import ExpPublish from './components/exp-publish.vue';

useHead({
  title: '系统管理',
});

const router = useRouter();
const userStore = useUserStore();
const { loggedIn, isTeacher } = storeToRefs(userStore);

watchEffect(() => {
  if (loggedIn.value && !isTeacher.value) {
    router.replace('/');
  }
});
</script>
