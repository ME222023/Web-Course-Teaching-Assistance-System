<template>
  <div class="w-full h-full flex">
    <div class="mt-10 mx-auto flex flex-col min-w-100">
      <h2> 注册 </h2>
      <client-only>
        <el-form
          :model="form"
          :rules
          label-width="80px"
          label-position="left"
          hide-required-asterisk
        >
          <el-form-item label="用户名" prop="username" required>
            <el-input
              v-model="form.username"
              placeholder="学号或工号"
              @keydown.enter="onClickRegister"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" required>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              @keydown.enter="onClickRegister"
            ></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword" required>
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              @keydown.enter="onClickRegister"
            ></el-input>
          </el-form-item>
          <el-button
            class="mt-2"
            type="primary"
            :disabled="loading"
            :loading
            @click="onClickRegister"
          >
            注册
          </el-button>
          <el-button class="mt-2" type="default" @click="$router.push('/login')">
            登录已有帐号
          </el-button>
        </el-form>
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import { register } from '~/util/db'
  import { handleError } from '~/util/error_parser'

  interface Form {
    username: string
    password: string
    confirmPassword: string
  }

  definePageMeta({
    layout: 'login-register',
  })

  const userStore = useUserStore()
  const router = useRouter()

  const form = ref<Form>({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const loading = ref(false)
  const rules: FormRules<Form> = {
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      {
        validator: (_, value, callback) => {
          if (value !== form.value.password) {
            callback('两次输入密码不一致')
          } else {
            callback()
          }
        },
        trigger: ['blur', 'change'],
      },
    ],
  }

  async function onClickRegister() {
    if (!form.value.username || !form.value.password) {
      return
    }
    try {
      loading.value = true
      const token = await register(form.value.username, form.value.password)
      userStore.token = token
      ElMessage.success('注册成功')
      router.push('/')
    } catch (error: any) {
      handleError('注册', error)
    } finally {
      loading.value = false
    }
  }
</script>
