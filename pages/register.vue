<template>
  <div class="w-full h-full flex">
    <div class="mt-10 mx-auto flex flex-col min-w-100">
      <h2> 注册 </h2>
      <client-only>
        <el-form
          ref="formRef"
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
  import type { FormInstance, FormRules } from 'element-plus'
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
  useHead({
    title: '注册',
  })

  const userStore = useUserStore()
  const router = useRouter()

  const form = ref<Form>({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const rules: FormRules<Form> = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'change' },
      { message: '用户名长度必须为 10 位数字', trigger: 'change', pattern: /^\d{10}$/ },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'change' },
      { min: 6, message: '密码长度不能小于 6 位', trigger: 'change' },
      {
        validator: (_, value, callback) => {
          const containsLetter = /[a-zA-Z]/.test(value)
          const containsNumber = /[0-9]/.test(value)
          const containsSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
          const isValid =
            [containsLetter, containsNumber, containsSpecialChar].filter(Boolean).length >= 2
          if (!isValid) {
            callback('密码必须包含字母、数字和特殊字符其中两种')
          } else {
            callback()
          }
        },
        trigger: 'change',
      },
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'change' },
      {
        validator: (_, value, callback) => {
          if (value !== form.value.password) {
            callback('两次输入密码不一致')
          } else {
            callback()
          }
        },
        trigger: 'change',
      },
    ],
  }

  async function onClickRegister() {
    const isValid = await formRef.value?.validate().catch(() => false)
    if (!isValid) {
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
