<template>
  <div class="page-container flex flex-col xl:flex-row ml-10 min-w-120 gap-6">
    <div class="container">
      <div class="row">
        <div class="span8 page-content">
          <article class="type-page hentry clearfix"></article>
          <el-form
            ref="questionForm"
            :model="form"
            label-width="100px"
            @submit.native.prevent="onSubmit"
          >
            <el-form-item
              label="实验名称"
              prop="title"
              :rules="[{ required: true, message: '请输入实验名称', trigger: 'blur' }]"
            >
              <el-input v-model="form.title" placeholder="请输入实验名称"></el-input>
            </el-form-item>
            <el-form-item
              label="实验描述"
              prop="content"
              :rules="[{ required: true, message: '请输入实验描述', trigger: 'blur' }]"
            >
              <el-input
                type="textarea"
                v-model="form.content"
                rows="6"
                placeholder="请输入实验描述"
              ></el-input>
            </el-form-item>
            <el-form-item label="上传图片">
              <el-upload
                action="#"
                list-type="picture"
                multiple
                accept="image/jpeg,image/png"
                method="get"
                v-model:file-list="imageFileList"
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
              <div v-if="imageFileList.length > 0" class="image-preview">
                <el-image
                  v-for="(file, index) in imageFileList"
                  :key="file.uid"
                  :src="file.url"
                  :preview-src-list="previewSrcList"
                  :initial-index="index"
                  fit="cover"
                  class="image-item"
                />
              </div>
            </el-form-item>
            <el-form-item label="上传音频">
              <el-upload
                action="#"
                multiple
                accept="audio/mp3,audio/wav"
                method="get"
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
                method="get"
                accept="video/mp4"
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
            <el-form-item>
              <el-button type="primary" @click="onSubmit">发布实验</el-button>
              <el-button @click="onReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, UploadFile } from 'element-plus'
  import { addExercise } from '~/util/db'
  import { convertFileToBase64 } from '~/util/files'

  const imageFileList = ref<UploadFile[]>([])
  const audioFileList = ref<UploadFile[]>([])
  const videoFileList = ref<UploadFile[]>([])
  const userStore = useUserStore()

  interface Form {
    title: string
    content: string
  }

  interface UploadInfo {
    success: number
    fail: number
  }

  const questionForm = ref<FormInstance>()
  const form = ref<Form>({
    title: '',
    content: '',
  })

  const uploadInfo = ref<Record<'images' | 'audios' | 'videos', UploadInfo>>({
    images: { success: 0, fail: 0 },
    audios: { success: 0, fail: 0 },
    videos: { success: 0, fail: 0 },
  })

  const handleImageUpload = () => {
    uploadInfo.value.images.success++
  }

  const handleAudioUpload = () => {
    uploadInfo.value.audios.success++
  }

  const handleVideoUpload = () => {
    uploadInfo.value.videos.success++
  }

  const handleRemove =
    (type: 'images' | 'audios' | 'videos') => (file: UploadFile, fileList: UploadFile[]) => {
      uploadInfo.value[type].success--
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

  const onSubmit = async () => {
    if (!userStore.userInfo?.id) return
    const isValid = await questionForm.value?.validate().catch(() => false)
    if (!isValid) return ElMessage.error('请完善表单信息')

    await addExercise({
      creatorId: userStore.userInfo.id,
      title: form.value.title,
      isPublished: 1,
      content: form.value.content,
      images: await convertFileToBase64(imageFileList.value),
      audios: await convertFileToBase64(audioFileList.value),
      videos: await convertFileToBase64(videoFileList.value),
    })
    ElMessage.success('发布实验成功')
    onReset()
  }

  // 清空上传文件列表
  const clearAllUploads = () => {
    imageFileList.value = []
    audioFileList.value = []
    videoFileList.value = []
  }

  const onReset = () => {
    if (questionForm.value) {
      questionForm.value.resetFields()
    }
    // 重置上传信息
    resetUploadInfo()
    // 清空表单数据
    form.value.title = ''
    form.value.content = ''
    // 清空上传文件列表
    clearAllUploads()
  }

  // 重置上传信息
  const resetUploadInfo = () => {
    uploadInfo.value.images.success = 0
    uploadInfo.value.images.fail = 0
    uploadInfo.value.audios.success = 0
    uploadInfo.value.audios.fail = 0
    uploadInfo.value.videos.success = 0
    uploadInfo.value.videos.fail = 0
  }

  // 获取图片的预览 URL 列表
  const previewSrcList = computed(() => {
    return imageFileList.value.map((file) => file.url!)
  })
</script>

<style scoped>
  .page-container {
    padding: 20px;
  }
  .page-content {
    padding: 20px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .upload-info {
    margin-top: 10px;
    color: #666;
  }
  .image-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  .image-item {
    width: 100px;
    height: 100px;
    object-fit: cover;
    cursor: pointer;
  }
</style>
