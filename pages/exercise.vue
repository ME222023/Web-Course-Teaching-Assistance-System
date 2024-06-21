<template>
  <div>
    <el-row>
      <el-col :span="5">
        <div class="flex flex-col">
          <el-button
            v-for="exercise in allexercises"
            class="!justify-start !ml-0"
            :key="exercise.id"
            text
            @click="changeExercise(exercise.id)"
          >
            {{ exercise.id }}. {{ exercise.title }}
          </el-button>
        </div>
      </el-col>
      <el-col :span="18" :offset="1">
        <div v-if="exercise" class="flex flex-col">
          <div class="flex items-center">
            <h2>{{ exercise.title }}</h2>
            <span class="ml-auto">ID: {{ exercise.id }}</span>
          </div>

          <el-text v-if="exercise" class="w-full" margin-top="20px">
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
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-error="handleError"
              :on-success="onFileChange"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text"> Drop file here or <em>click to upload</em> </div>
            </el-upload>
            <el-button type="primary" @click="submit">提交</el-button>
          </el-text>
        </div>

        <el-empty
          v-else
          class="mt-10"
          :image="ExercisePlaceholderWebP"
          description="选择一个题目，开始做题吧"
        ></el-empty>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElMessage, type UploadFile, type UploadFiles, type UploadProps } from 'element-plus'
  import { getExerciseById, listExercise, addSolution } from '~/util/db'
  import type { Exercise, Solution } from '~/types'
  import { SolutionStatus } from '~/types'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { handleFileChange } from '~/util/files'
  import ExercisePlaceholderWebP from '~/assets/icons/exercise-placeholder.webp'

  const userStore = useUserStore()
  const route = useRoute()
  const router = useRouter()
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
    status: SolutionStatus.Pending,
  })

  onMounted(async () => {
    allexercises.value = await listExercise()
    watch(
      () => route.query.id,
      async (exerciseId) => {
        if (!exerciseId) return
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

  const onFileChange = async (_: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    try {
      const base64Strings = await handleFileChange(uploadFiles)
      base64Strings.forEach((base64) => {
        console.log(base64)
      })
      base64 = base64Strings
    } catch (error) {
      ElMessage.error('文件处理出错: ' + error)
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
    if (!userStore.userInfo) {
      ElMessage.error('请先登录')
      return
    }
    solution.value.exerciseId = Number(route.query.id)
    solution.value.content = input.value
    solution.value.imageUrls = base64
    solution.value.creatorId = userStore.userInfo.id
    if ((!solution.value.content)||(!solution.value.imageUrls)) {
      ElMessage.error('答案不能为空')
      return
    }
    try {
      const solutionClone = JSON.parse(JSON.stringify(solution.value))

      console.log('提交的 Solution 对象:', solutionClone)

      addSolution(solutionClone)
      ElMessage.success('提交成功')
    } catch (error) {
      console.error('克隆 Solution 对象失败:', error)
      ElMessage.error('提交失败: ' + error)
    }
    router.replace('/profile')
    // addSolution(solution.value)
    // console.log('提交的Solution对象:', solution.value)
  }
  function handleError() {
    ElMessage.error('图片异常，请更换图片')
  }
</script>

<style></style>
