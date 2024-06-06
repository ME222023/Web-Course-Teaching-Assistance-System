<template>
  <div class="flex flex-col">
    Hello World
    <el-button @click="onClickAddTestData">插入测试题目</el-button>

    <div class="flex flex-col mt-4 gap-y-2">
      <el-button v-for="exercise, key in exercises" :key link @click="onClickExercise(exercise)">
        {{ exercise }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Exercise } from '~/types'
  import { addTestExerciseData, listExercise } from '~/util/db'

  const router = useRouter()

  const exercises = ref<Exercise[]>([])

  function onClickAddTestData() {
    addTestExerciseData()
    ElMessage.success('插入测试数据成功')
    fetchExercises()
  }

  function onClickExercise(exercise: Exercise) {
    router.push({
      path: '/exercise',
      query: { id: exercise.id },
    })
  }

  async function fetchExercises() {
    exercises.value = await listExercise()
  }

  onMounted(() => {
    fetchExercises()
  })
</script>

<style></style>
