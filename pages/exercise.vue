<template>
  <div>
    <el-row>
      <el-col :span="4">
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
            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            multiple
            margin="20px"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text"> Drop file here or <em>click to upload</em> </div>
          </el-upload>
        </el-text>
        <p v-else>Loading...</p>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { getExerciseById, listExercise } from '~/util/db'
  import type { Exercise } from '~/types'
  import { UploadFilled } from '@element-plus/icons-vue'

  const route = useRoute()
  const exerciseId = route.query.id
  const exercise = ref<Exercise>()
  const allexercises = ref<Exercise[]>([])
  const input = ref('')
  const router = useRouter()

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

  function changeExercise(id: number) {
    router.push({
      path: '/exercise',
      query: { id },
    })
  }
</script>

<style></style>
