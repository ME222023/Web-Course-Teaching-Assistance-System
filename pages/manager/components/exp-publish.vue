<template>
  <div class="page-container flex flex-col xl:flex-row ml-10 min-w-120 gap-6">
    <div class="container">
      <div class="row">
        <div class="span8 page-content">
          <article class="type-page hentry clearfix"></article>
          <el-form ref="questionForm" :model="form" label-width="100px" @submit.native.prevent="onSubmit">
            <el-form-item label="实验名称" prop="name" :rules="[{ required: true, message: '请输入实验名称', trigger: 'blur' }]">
              <el-input v-model="form.name" placeholder="* Please enter the name of your experiment"></el-input>
            </el-form-item>
            <el-form-item label="实验描述" prop="message" :rules="[{ required: true, message: '请输入实验描述', trigger: 'blur' }]">
              <el-input type="textarea" v-model="form.message" rows="6" placeholder="* Please enter the description of your experiment"></el-input>
            </el-form-item>
            <el-form-item label="上传图片">
              <el-upload
                action="#"
                list-type="picture"
                multiple
                v-model:file-list="imageFileList"
                :on-success="handleImageUpload"
                :on-remove="handleRemove('images')"
                :before-upload="beforeImageUpload"
              >
                <el-button type="primary">点击或拖至此处上传</el-button>
              </el-upload>
              <ImageList :imageFileList="imageFileList" />
              <div v-if="uploadInfo.images.success + uploadInfo.images.fail > 0">
                上传成功: {{ uploadInfo.images.success }} 张图片，上传失败: {{ uploadInfo.images.fail }} 张图片
              </div>
            </el-form-item>
            <el-form-item label="上传音频">
              <el-upload
                action="#"
                list-type="picture"
                multiple
                v-model:file-list="audioFileList"
                :on-success="handleAudioUpload"
                :on-remove="handleRemove('audios')"
                :before-upload="beforeAudioUpload"
              >
                <el-button type="primary">点击或拖至此处上传</el-button>
              </el-upload>
              <div v-if="uploadInfo.audios.success + uploadInfo.audios.fail > 0">
                上传成功: {{ uploadInfo.audios.success }} 个音频，上传失败: {{ uploadInfo.audios.fail }} 个音频
              </div>
            </el-form-item>
            <el-form-item label="上传视频">
              <el-upload
                action="#"
                list-type="picture"
                multiple
                v-model:file-list="videoFileList"
                :on-success="handleVideoUpload"
                :on-remove="handleRemove('videos')"
                :before-upload="beforeVideoUpload"
              >
                <el-button type="primary">点击或拖至此处上传</el-button>
              </el-upload>
              <div v-if="uploadInfo.videos.success + uploadInfo.videos.fail > 0">
                上传成功: {{ uploadInfo.videos.success }} 个视频，上传失败: {{ uploadInfo.videos.fail }} 个视频
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
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import ImageList from './ImageList.vue';

const imageFileList = ref<UploadFile[]>([]);
const audioFileList = ref<UploadFile[]>([]);
const videoFileList = ref<UploadFile[]>([]);

interface Form {
  name: string;
  message: string;
}

interface UploadInfo {
  success: number;
  fail: number;
}

const questionForm = ref<HTMLFormElement | null>(null);
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

const handleRemove = (type: 'images' | 'audios' | 'videos') => (file: UploadFile, fileList: UploadFile[]) => {
  uploadInfo.value[type].success--;
};

// 上传图像的限制
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

// 上传音频的限制
const beforeAudioUpload = (file: File) => {
  if (!/\.(mp3|wav)$/i.test(file.name)) {
    ElMessage.error('只能上传 MP3、WAV 格式的音频');
    return false;
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('音频文件过大，不能超过10MB');
    uploadInfo.value.audios.fail++;
    return
    false;
  }
  return true;
};

// 上传视频的限制
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
  if (questionForm.value) {
    questionForm.value.validate((valid: boolean) => {
      if (valid) {
        // 获取用户名
        const acc_name = localStorage.getItem('account');

        // 获取实验名称和发布时间
        const title = form.value.name;
        const createdAt = new Date().toLocaleString();

        // 存储数据到 localStorage
        let storedData1 = JSON.parse(localStorage.getItem('submittedData1') || '[]');
        let storedData2 = JSON.parse(localStorage.getItem('submittedData2') || '[]');

        storedData1.unshift(form.value.name);
        storedData2.unshift(form.value.message);

        const account = localStorage.getItem('account');

        const index = storedData1.length - 1;
        localStorage.setItem(`indexins1${form.value.name}${account}`, JSON.stringify(index));
        localStorage.setItem('submittedData1', JSON.stringify(storedData1));
        localStorage.setItem(`submittedData${account}`, JSON.stringify(storedData1));
        localStorage.setItem(`imgURLs${title}${account}`, JSON.stringify([])); // 修改此处以保存图片URL
        localStorage.setItem(`${title}.content${account}`, JSON.stringify(storedData2.toString()));
        localStorage.setItem(`typeof${title}${account}`, "0");
        localStorage.setItem(`publishTime${title}${account}`, createdAt);

        // 提示成功
        ElMessage.success('实验发布成功！');
        onReset();
      } else {
        ElMessage.error('请完善表单信息');
        return false;
      }
    });
  }
};

// 清空上传文件列表
const clearAllUploads = () => {
  imageFileList.value = [];
  audioFileList.value = [];
  videoFileList.value = [];
};

const onReset = () => {
  if (questionForm.value) {
    questionForm.value.resetFields();
  }
  // 重置上传信息
  resetUploadInfo();
  // 清空表单数据
  form.value.name = '';
  form.value.message = '';
  // 清空上传文件列表
  clearAllUploads();
};

// 重置上传信息
const resetUploadInfo = () => {
  uploadInfo.value.images.success = 0;
  uploadInfo.value.images.fail = 0;
  uploadInfo.value.audios.success = 0;
  uploadInfo.value.audios.fail = 0;
  uploadInfo.value.videos.success = 0;
  uploadInfo.value.videos.fail = 0;
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
