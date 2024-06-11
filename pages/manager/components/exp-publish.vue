<template>
  <div class="page-container flex flex-col xl:flex-row ml-10 min-w-120 gap-6">
    <div class="container">
      <div class="row">
        <div class="span8 page-content">
          <article class="type-page hentry clearfix">
            <!-- 实验发布表单 -->
            <el-form
              ref="questionForm"
              :model="form"
              label-width="100px"
              :rules="rules"
              @submit.native.prevent="onSubmit"
            >
              <el-form-item label="实验名称" prop="name">
                <el-input v-model="form.name" placeholder="* Please enter the name of your experiment"></el-input>
              </el-form-item>
              <el-form-item label="实验描述" prop="message">
                <el-input type="textarea" v-model="form.message" rows="6" placeholder="* Please enter the description of your experiment"></el-input>
              </el-form-item>
              <el-form-item label="上传图片">
                <el-upload
                  action="#"
                  list-type="picture"
                  multiple
                  :on-success="handleImageUpload"
                  :on-remove="handleRemove('images')"
                  :before-upload="beforeImageUpload"
                >
                  <el-button type="primary">点击或拖至此处上传</el-button>
                </el-upload>
                <div v-if="uploadInfo.images.success + uploadInfo.images.fail > 0" class="upload-info">
                  上传成功: {{ uploadInfo.images.success }} 张图片，上传失败: {{ uploadInfo.images.fail }} 张图片
                </div>
              </el-form-item>
              <el-form-item label="上传音频">
                <el-upload
                  action="#"
                  list-type="picture"
                  multiple
                  :on-success="handleAudioUpload"
                  :on-remove="handleRemove('audios')"
                  :before-upload="beforeAudioUpload"
                >
                  <el-button type="primary">点击或拖至此处上传</el-button>
                </el-upload>
                <div v-if="uploadInfo.audios.success + uploadInfo.audios.fail > 0" class="upload-info">
                  上传成功: {{ uploadInfo.audios.success }} 个音频，上传失败: {{ uploadInfo.audios.fail }} 个音频
                </div>
              </el-form-item>
              <el-form-item label="上传视频">
                <el-upload
                  action="#"
                  list-type="picture"
                  multiple
                  :on-success="handleVideoUpload"
                  :on-remove="handleRemove('videos')"
                  :before-upload="beforeVideoUpload"
                >
                  <el-button type="primary">点击或拖至此处上传</el-button>
                </el-upload>
                <div v-if="uploadInfo.videos.success + uploadInfo.videos.fail > 0" class="upload-info">
                  上传成功: {{ uploadInfo.videos.success }} 个视频，上传失败: {{ uploadInfo.videos.fail }} 个视频
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" native-type="submit">发布实验</el-button>
                <el-button @click="onReset">重置</el-button>
              </el-form-item>
            </el-form>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { ElForm, ElFormItem, ElInput, ElUpload, ElButton, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

interface Form {
  name: string;
  message: string;
}

interface UploadInfo {
  success: number;
  fail: number;
}

const props = defineProps({
  rules: {
    type: Object,
    default: () => ({
      name: [{ required: true, message: '请输入实验名称', trigger: 'blur' }],
      message: [{ required: true, message: '请输入实验描述', trigger: 'blur' }],
    }),
  },
});

const form = ref<Form>({
  name: '',
  message: '',
});

const uploadInfo = ref<Record<'images' | 'audios' | 'videos', UploadInfo>>({
  images: { success: 0, fail: 0 },
  audios: { success: 0, fail: 0 },
  videos: { success: 0, fail: 0 },
});

const handleImageUpload = () => {
  uploadInfo.value.images.success++;
};

const handleAudioUpload = () => {
  uploadInfo.value.audios.success++;
};

const handleVideoUpload = () => {
  uploadInfo.value.videos.success++;
};

const handleRemove = (type: 'images' | 'audios' | 'videos') => (file: any, fileList: any[]) => {
  uploadInfo.value[type].success--;
};

const beforeImageUpload = (file: File) => {
  if (!/\.(jpg|jpeg|png|gif)$/i.test(file.name)) {
    ElMessage.error('只能上传 JPG、PNG、GIF 格式的图片');
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片文件过大，不能超过5MB');
    uploadInfo.value.images.fail++;
    return false;
  }
  return true;
};

const beforeAudioUpload = (file: File) => {
  if (!/\.(mp3|wav)$/i.test(file.name)) {
    ElMessage.error('只能上传 MP3、WAV 格式的音频');
    return false;
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('音频文件过大，不能超过10MB');
    uploadInfo.value.audios.fail++;
    return false;
  }
  return true;
};

const beforeVideoUpload = (file: File) => {
  if (!/\.(mp4|mov|avi|wmv)$/i.test(file.name)) {
    ElMessage.error('只能上传 MP4、MOV、AVI、WMV 格式的视频');
    return false;
  }
  if (file.size > 100 * 1024 * 1024) {
    ElMessage.error('视频文件过大，不能超过100MB');
    uploadInfo.value.videos.fail++;
    return false;
  }
  return true;
};

const onSubmit = () => {
  // submit logic
};

const onReset = () => {
  // reset logic
};

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
</style>
