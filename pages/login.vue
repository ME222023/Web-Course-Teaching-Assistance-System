<template>
  <div class="w-full h-full flex">
    <div class="mt-10 mx-auto flex flex-col min-w-100">
      <h2> 登录 </h2>
      <client-only>
        <el-form
          :model="form"
          :rules="rules"
          label-width="80px"
          label-position="left"
          hide-required-asterisk
        >
          <el-form-item label="用户名" prop="username" required>
            <el-input
              v-model="form.username"
              placeholder="学号或工号"
              @keydown.enter="onClickLogin"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" required>
            <el-input
              v-model="form.password"
              type="password"
              @keydown.enter="onClickLogin"
            ></el-input>
          </el-form-item>

          <div class="flex items-center mt-6">
            <el-button type="primary" :disabled="loading" :loading @click="onClickLogin">
              登录
            </el-button>
            <el-button type="default" @click="$router.push('/register')"> 注册 </el-button>

            <div class="ml-auto">
              <el-tooltip content="请联系老师重置密码" placement="top">
                <el-link type="info" underline :icon="ElIconQuestionFilled">忘记密码？</el-link>
              </el-tooltip>
            </div>
          </div>
        </el-form>
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import { login } from '~/util/db'
  import { handleError } from '~/util/error_parser'

  interface Form {
    username: string
    password: string
  }

  definePageMeta({
    layout: 'login-register',
  })
  useHead({
    title: '登录',
  })

  const userStore = useUserStore()
  const router = useRouter()

  const form = ref<Form>({
    username: '',
    password: '',
  })
  const loading = ref(false)
  const rules: FormRules<Form> = {
    password: [{ required: true, message: '请输入密码', trigger: 'change' }],
    username: [{ required: true, message: '请输入用户名', trigger: 'change' }],
  }

  async function onClickLogin() {
    if (!form.value.username || !form.value.password) {
      return
    }
    try {
      loading.value = true
      const token = await login(form.value.username, form.value.password)
      userStore.token = token
      ElMessage.success('登录成功')
      router.push('/')
    } catch (error: any) {
      handleError('登录', error)
    } finally {
      loading.value = false
    }
  }
</script>
