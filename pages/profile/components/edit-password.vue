<template>
  <div class="flex flex-col ml-6 mt-2 min-w-120 w-2/3 max-w-160">
    <client-only>
      <el-form ref="formRef" :model="form" :rules label-width="100px" label-position="left">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            placeholder="请输入旧密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading :disabled="loading" @click="onClickSubmit">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </client-only>
  </div>
</template>

<script setup lang="ts">
  import { type FormInstance, type FormRules } from 'element-plus'
  import { changePassword } from '~/util/db'
  import { handleError } from '~/util/error_parser'

  const userStore = useUserStore()

  interface Form {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }
  const form = ref<Form>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const loading = ref(false)
  const formRef = ref<FormInstance>()
  const rules: FormRules<Form> = {
    oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'change' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'change' },
      {
        validator: (rule, value, callback) => {
          if (value === form.value.oldPassword) {
            callback('新密码不能与旧密码相同')
          } else {
            callback()
          }
        },
        trigger: 'change',
      },
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
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== form.value.newPassword) {
            callback('两次输入的密码不一致')
          } else {
            callback()
          }
        },
        trigger: 'change',
      },
    ],
  }

  async function onClickSubmit() {
    if (!userStore.userInfo?.id) return
    try {
      await formRef.value?.validate()
    } catch {
      return
    }

    loading.value = true
    try {
      const newToken = await changePassword(
        userStore.userInfo.id,
        form.value.oldPassword,
        form.value.newPassword,
      )
      userStore.token = newToken
      ElMessage.success('修改成功')
    } catch (error) {
      handleError(error)
    } finally {
      loading.value = false
    }
  }
</script>
