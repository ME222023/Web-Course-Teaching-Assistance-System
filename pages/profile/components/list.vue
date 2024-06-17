<template>
  <div class="flex flex-col ml-6 mt-2 min-w-120 w-full max-w-160">
    <el-table :data="combinedData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="title" label="Title" width="150" />
      <el-table-column prop="state" label="State" width="120" />
      <el-table-column prop="city" label="City" width="120" />
      <el-table-column prop="address" label="Address" width="600" />
      <el-table-column prop="zip" label="Zip" width="120" />
      <el-table-column fixed="right" label="Operations" width="120">
        <template #default>
          <el-button link type="primary" size="small" @click="handleClick"> Detail </el-button>
          <el-button link type="primary" size="small">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
  import type { Exercise, Solution } from '~/types'
  import { listExercise, listSolution } from '~/util/db'

  type ExerciseWithSolution = Exercise & {
    latestSolution?: Solution
  }

  const userStore = useUserStore()

  const combinedData = ref<ExerciseWithSolution[]>([])

  onMounted(() => {
    watchEffect(async () => {
      if (!userStore.userInfo?.id) return
      const exercises = await listExercise()
      const solutions = await listSolution(userStore.userInfo.id)
      combinedData.value = exercises.map((exercise) => {
        const solution = solutions
          .filter((solution) => solution.exerciseId === exercise.id)
          .sort((a, b) => a.createdAt - b.createdAt)
        return {
          ...exercise,
          latestSolution: solution[0],
        }
      })

      console.log('Combined Data:', combinedData.value)
    })
  })

  const handleClick = () => {
    console.log('click')
  }
</script>

<style></style>
