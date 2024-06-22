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
        :file-list="imageFileList"
        :on-success="handleImageUpload"
        :on-remove="handleRemove('images')"
        :before-upload="beforeImageUpload"
      >
        <el-button type="primary">点击或拖至此处上传</el-button>
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
        accept="audio/mp3,audio/wav"
        v-model:file-list="audioFileList"
        :on-success="handleAudioUpload"
        :on-remove="handleRemove('audios')"
        :before-upload="beforeAudioUpload"
      >
        <el-button type="primary">点击或拖至此处上传</el-button>
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
        v-model:file-list="videoFileList"
        :on-success="handleVideoUpload"
        :on-remove="handleRemove('videos')"
        :before-upload="beforeVideoUpload"
      >
        <el-button type="primary">点击或拖至此处上传</el-button>
      </el-upload>
      <div v-if="videoFileList.length">
        <video
          class="w-64 h-36"
          v-for="(video, key) in videoFileList"
          :key="key"
          :src="video.url"
          controls
        ></video>
      </div>
      <div v-if="uploadInfo.videos.success + uploadInfo.videos.fail > 0">
        上传成功: {{ uploadInfo.videos.success }} 个视频，上传失败:
        {{ uploadInfo.videos.fail }} 个视频
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  import { ref, defineProps, defineEmits, watch } from 'vue'
  import { convertFileToBase64 } from '~/util/files'

  const props = defineProps({
    initialForm: {
      type: Object,
      required: true,
      default: () => ({
        title: '',
        content: '',
        images: [] as string[],
        audios: [] as string[],
        videos: [] as string[],
      }),
    },
  })

  const emit = defineEmits(['submit', 'reset'])

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
      // 使用类型断言来告诉 TypeScript url 是一个字符串
      imageFileList.value = newForm.images.map(
        (url: string) => ({ name: '', url }) as { name: string; url: string },
      )

      audioFileList.value = newForm.audios.map(
        (url: string) => ({ name: '', url }) as { name: string; url: string },
      )
      videoFileList.value = newForm.videos.map(
        (url: string) => ({ name: '', url }) as { name: string; url: string },
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
    // 不直接存储url的信息
    //imageFileList.value.push({ name: file.name, url: URL.createObjectURL(file.raw) })
    //uploadInfo.value.images.success += 1
    // 获取文件名
    // console.log(file)
    const fileName = file.name
    // 添加到文件列表中，只存储文件名
    let url = await convertFileToBase64([file])
    props.initialForm.images.push(url)
    // imageFileList.value.push({ name: fileName, url: fileName })
    uploadInfo.value.images.success += 1
  }

  const handleAudioUpload = async (response: any, file: any) => {
    //audioFileList.value.push({ name: file.name, url: URL.createObjectURL(file.raw) })
    //uploadInfo.value.audios.success += 1
    // 获取文件名
    const fileName = file.name
    // 添加到文件列表中，只存储文件名
    //audioFileList.value.push({ name: fileName, url: fileName })
    let url = await convertFileToBase64([file])
    props.initialForm.audios.push(url)
    uploadInfo.value.audios.success += 1
  }

  const handleVideoUpload = async (response: any, file: any) => {
    //videoFileList.value.push({ name: file.name, url: URL.createObjectURL(file.raw) })
    //uploadInfo.value.videos.success += 1
    // 获取文件名
    const fileName = file.name
    // 添加到文件列表中，只存储文件名
    //videoFileList.value.push({ name: fileName, url: fileName })
    let url = await convertFileToBase64([file])
    //console.log('handleVideosUpload', url)
    props.initialForm.videos.push(url)
    uploadInfo.value.videos.success += 1
  }

  const handleRemove = (type: 'images' | 'audios' | 'videos') => (file: any, fileList: any) => {
    const index = form.value[type].findIndex((f: string) => f === file.url)
    if (index !== -1) {
      form.value[type].splice(index, 1)
      uploadInfo.value[type].success -= 1
    }
  }

  const beforeImageUpload = (file: File) => {
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isJPG && !isPNG) {
      ElMessage.error('上传图片只能是 JPG/PNG 格式!')
    }
    if (!isLt2M) {
      ElMessage.error('上传图片大小不能超过 2MB!')
    }
    return (isJPG || isPNG) && isLt2M
  }

  const beforeAudioUpload = (file: File) => {
    if (!/\.(mp3|wav)$/i.test(file.name)) {
      ElMessage.error('只能上传 MP3、WAV 格式的音频')
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('音频文件过大，不能超过10MB')
      uploadInfo.value.audios.fail++
      return false
    }
    return true
  }

  const beforeVideoUpload = (file: File) => {
    const isMP4 = file.type === 'video/mp4'
    const isLt100M = file.size / 1024 / 1024 < 100

    if (!isMP4) {
      ElMessage.error('上传视频只能是 MP4 格式!')
    }
    if (!isLt100M) {
      ElMessage.error('上传视频大小不能超过 100MB!')
    }
    return isMP4 && isLt100M
  }
</script>
