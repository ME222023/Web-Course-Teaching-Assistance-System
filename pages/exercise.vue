<template>
  <div>
    <el-row>
      <el-col :span="4" >
        <el-button
          v-for="exercise in allexercises"
          :key="exercise.id"
          text
          @click="changeExercise(exercise.id)"
          class="!ml-0"
        >
          {{ exercise.id }}: {{ exercise.title }}
        </el-button>
      </el-col>
      <el-col :span="20">
        <el-row>
          <el-col :span="20" v-if="exercise">
            <h2>{{ exercise.title }}</h2>
          </el-col>
          <el-col :span="4">
            <p style="text-align: center">ID: {{ exerciseId }}</p>
          </el-col>
        </el-row>
        <el-text v-if="exercise" margin-top="20px">
          <p>{{ exercise.content }}</p>
          <el-input
            v-model="input"
            type="textarea"
            :autosize="{ minRows: 15, maxRows: 50 }"
            style="width: 100%"
            placeholder="在此输入答案..."
          />
          <span>上传图片回答</span>
          <el-upload
            class="uploadpng"
            drag
            action="#"
            multiple
            :on-change="onFileChange"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              Drop file here or <em>click to upload</em>
            </div>
          </el-upload>
          <el-button type="primary" @click="submit">提交</el-button>
        </el-text>
        <p v-else>Loading...</p>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElMessage, type UploadFile, type UploadFiles, type UploadProps } from 'element-plus'
  import { getExerciseById, listExercise } from '~/util/db'
  import type { Exercise, Solution } from '~/types'
  import { SolutionStatus } from '~/types'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { handleFileChange } from '~/util/files'

  const route = useRoute()
  const router = useRouter()
  const exerciseId = route.query.id
  const exercise = ref<Exercise>()
  const allexercises = ref<Exercise[]>([])
  const input = ref('')
  let base64: string[] = []

  const solution = ref<Solution>({
    id: 0,
    exerciseId: 0,
    creatorId: 0,
    content: '',
    language: 'text',
    createdAt: Date.now(),
    imageUrls: [],
    status: SolutionStatus.Pending
  })

  onMounted(async () => {
    allexercises.value = await listExercise()
    watch(
      () => route.query.id,
      async (exerciseId) => {
        if (exerciseId) {
          exercise.value = await getExerciseById(Number(exerciseId))
          if (!exercise.value) {
            ElMessage.error('Exercise not found')
          }
        } else {
          ElMessage.error('Invalid exercise ID')
        }
      },
      { immediate: true },
    )
  })

  const onFileChange = async (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    try {
      const base64Strings = await handleFileChange(uploadFiles);
      base64Strings.forEach(base64 => {
        console.log(base64);
      });
      base64 = base64Strings;
    } catch (error) {
      ElMessage.error('文件处理出错: ' + error);
    }
  }

  const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
    console.log(uploadFile, uploadFiles)
  }

  const handlePreview: UploadProps['onPreview'] = (file) => {
    console.log(file)
  }

  function changeExercise(id: number) {
    router.push({
      path: '/exercise',
      query: { id },
    })
  }

  function submit() {
    solution.value.exerciseId = Number(exerciseId)
    solution.value.content = input.value
    solution.value.imageUrls = base64
    
    console.log('提交的Solution对象:', solution.value)
    // 在这里添加其他提交逻辑，例如发送到后端API
  }
</script>

<style></style>