<template>
  <div class="flex flex-col ml-6 mt-2 min-w-120 w-2/3 max-w-160">
    <client-only>
      <el-form label-width="80px" label-position="left">
        <el-form-item label="用户名">{{ userInfoForm.username }}</el-form-item>
        <el-form-item label="身份">
          <el-tag>{{ role }}</el-tag>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <template v-if="userInfoForm.avatar">
            <el-avatar
              class="cursor-pointer"
              :size="60"
              :src="userInfoForm.avatar"
              @click="onClickSelectAvatar"
            ></el-avatar>
            <span class="ml-4 text-gray" @click="onClickSelectAvatar">点击修改头像</span>
          </template>
          <template v-else>
            <el-avatar
              class="cursor-pointer"
              :size="60"
              :icon="ElIconUser"
              @click="onClickSelectAvatar"
            ></el-avatar>
            <span class="ml-4 text-gray" @click="onClickSelectAvatar">点击选择头像</span>
          </template>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="userInfoForm.nickname"
            placeholder="请输入昵称"
            :maxlength="20"
            show-word-limit
            @keydown.enter.prevent
          ></el-input>
        </el-form-item>
        <el-form-item label="个人签名" prop="bio">
          <el-input
            v-model="userInfoForm.bio"
            type="textarea"
            :maxlength="200"
            :rows="3"
            show-word-limit
            placeholder="请输入个人签名"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading :disabled="loading" @click="onClickSubmit">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </client-only>

    <crop-picture
      ref="cropPictureRef"
      :aspect-ratio="1"
      @update="userInfoForm.avatar = $event"
    ></crop-picture>
  </div>
</template>

<script setup lang="ts">
  import type CropPicture from '~/components/crop-picture.vue'
  import type { UserInfo } from '~/types'
  import { updateUserInfo } from '~/util/db'
  import { handleError } from '~/util/error_parser'
  import { selectImage } from '~/util/files'

  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)

  const userInfoForm = ref<Omit<UserInfo, 'role' | 'id' | 'isDisabled'>>({
    username: '',
    avatar: '',
    bio: '',
    nickname: '',
  })
  const loading = ref(false)
  const cropPictureRef = ref<InstanceType<typeof CropPicture>>()
  const role = computed(() => {
    if (userInfo.value?.role === 'student') return '学生'
    if (userInfo.value?.role === 'teacher') return '老师'
    return '未知'
  })

  watchEffect(() => {
    // 保证 userInfoForm 与 userInfo 一致
    // 赋值时要避免把 userInfo 的响应性带给 userInfoForm，这样修改 userInfoForm 就不会触发 userInfo 更新
    if (userInfo.value) userInfoForm.value = { ...userInfo.value }
  })

  async function onClickSelectAvatar() {
    try {
      const image = await selectImage({ maxSize: 2 })
      cropPictureRef.value?.show(image)
    } catch (error) {
      handleError(error)
    }
  }

  async function onClickSubmit() {
    if (!userInfo.value?.id) return
    loading.value = true
    try {
      userInfoForm.value.nickname = userInfoForm.value.nickname?.trim()
      userInfoForm.value.bio = userInfoForm.value.bio?.trim()
      await updateUserInfo(userInfo.value.id, userInfoForm.value)
      userStore.refetchUserInfo()
      ElMessage.success('更新成功')
    } catch (error) {
      ElMessage.error('更新失败')
    } finally {
      loading.value = false
    }
  }
</script>
