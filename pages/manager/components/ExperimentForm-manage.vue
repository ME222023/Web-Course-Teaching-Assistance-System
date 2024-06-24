<template>
  <el-form ref="questionForm" :model="form" label-width="100px">
    <el-form-item
      label="实验名称"
      prop="title"
      :rules="[{ required: true, message: '请输入实验名称', trigger: 'blur' }]"
    >
      <el-input v-model="initialForm.title" placeholder="请输入实验名称"></el-input>
    </el-form-item>
    <el-form-item
      label="实验描述"
      prop="content"
      :rules="[{ required: true, message: '请输入实验描述', trigger: 'blur' }]"
    >
      <el-input
        type="textarea"
        v-model="initialForm.content"
        rows="6"
        placeholder="请输入实验描述"
      ></el-input>
    </el-form-item>
    <el-form-item label="上传图片">
      <el-upload
        action="#"
        list-type="picture"
        multiple
        method="get"
        accept="image/jpeg,image/png"
        :file-list="imageFileList"
        :on-success="handleImageUpload"
        :on-remove="handleRemove('images')"
        :before-upload="beforeImageUpload"
      >
        <el-button type="primary">点击上传</el-button>
      </el-upload>
      <div v-if="uploadInfo.images.success + uploadInfo.images.fail > 0">
        上传成功: {{ uploadInfo.images.success }} 张图片，上传失败:
        {{ uploadInfo.images.fail }} 张图片
      </div>
    </el-form-item>
    <el-form-item label="上传音频">
      <el-upload
        action="#"
        multiple
        method="get"
        accept="audio/mp3,audio/wav"
        v-model:file-list="audioFileList"
        :on-success="handleAudioUpload"
        :on-remove="handleRemove('audios')"
        :before-upload="beforeAudioUpload"
      >
        <el-button type="primary">点击上传</el-button>
      </el-upload>
      <div v-if="uploadInfo.audios.success + uploadInfo.audios.fail > 0">
        上传成功: {{ uploadInfo.audios.success }} 个音频，上传失败:
        {{ uploadInfo.audios.fail }} 个音频
      </div>
    </el-form-item>
    <el-form-item label="上传视频">
      <el-upload
        action="#"
        multiple
        accept="video/mp4"
        method="get"
        v-model:file-list="videoFileList"
        :on-success="handleVideoUpload"
        :on-remove="handleRemove('videos')"
        :before-upload="beforeVideoUpload"
      >
        <el-button type="primary">点击上传</el-button>
      </el-upload>
      <div v-if="uploadInfo.videos.success + uploadInfo.videos.fail > 0">
        上传成功: {{ uploadInfo.videos.success }} 个视频，上传失败:
        {{ uploadInfo.videos.fail }} 个视频
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  import { convertFileToBase64 } from '~/util/files'

  const props = defineProps<{
    initialForm: {
      title: string
      content: string
      images: string[]
      audios: string[]
      videos: string[]
    }
  }>()

  const form = ref({ ...props.initialForm })

  const imageFileList = ref<{ name: string; url: string }[]>([])
  const audioFileList = ref<{ name: string; url: string }[]>([])
  const videoFileList = ref<{ name: string; url: string }[]>([])

  watch(
    () => props.initialForm,
    (newForm, oldForm) => {
      form.value = { ...newForm }
      if (
        oldForm &&
        JSON.stringify(newForm.images) == JSON.stringify(oldForm.images) &&
        JSON.stringify(newForm.audios) == JSON.stringify(oldForm.audios) &&
        JSON.stringify(newForm.videos) == JSON.stringify(oldForm.videos)
      ) {
        return
      }
      imageFileList.value = newForm.images.map(
        (url, i) => ({ name: `图片 ${i + 1}`, url }) as { name: string; url: string },
      )
      audioFileList.value = newForm.audios.map(
        (url, i) => ({ name: `音频 ${i + 1}`, url }) as { name: string; url: string },
      )
      videoFileList.value = newForm.videos.map(
        (url, i) => ({ name: `视频 ${i + 1}`, url }) as { name: string; url: string },
      )
    },
    { deep: true, immediate: true },
  )

  const uploadInfo = ref({
    images: { success: 0, fail: 0 },
    audios: { success: 0, fail: 0 },
    videos: { success: 0, fail: 0 },
  })

  const handleImageUpload = async (response: any, file: any) => {
    props.initialForm.images.push(...(await convertFileToBase64([file])))
    uploadInfo.value.images.success += 1
  }

  const handleAudioUpload = async (response: any, file: any) => {
    props.initialForm.audios.push(...(await convertFileToBase64([file])))
    uploadInfo.value.audios.success += 1
  }

  const handleVideoUpload = async (response: any, file: any) => {
    props.initialForm.videos.push(...(await convertFileToBase64([file])))
    uploadInfo.value.videos.success += 1
  }

  const handleRemove = (type: 'images' | 'audios' | 'videos') => (file: any, fileList: any) => {
    const index = form.value[type].findIndex((f: string) => f === file.url)
    if (index !== -1) {
      form.value[type].splice(index, 1)
      uploadInfo.value[type].success -= 1
    }
  }

  // 上传图像的限制
  const beforeImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片文件过大，不能超过5MB')
      uploadInfo.value.images.fail++
      return false
    }
    return true
  }

  // 上传音频的限制
  const beforeAudioUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('音频文件过大，不能超过10MB')
      uploadInfo.value.audios.fail++
      return false
    }
    return true
  }

  // 上传视频的限制
  const beforeVideoUpload = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      ElMessage.error('视频文件过大，不能超过100MB')
      uploadInfo.value.videos.fail++
      return false
    }
    return true
  }
</script>
