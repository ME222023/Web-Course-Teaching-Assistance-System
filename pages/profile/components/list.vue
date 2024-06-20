<template>
  <div class="flex flex-col ml-6 mt-2 min-w-120 w-full max-w-240">
    <el-table :data="combinedData" style="width: 100%">
      <el-table-column prop="id" label="题目ID" width="100" />
      <el-table-column prop="title" label="题目标题" width="150" />
      <el-table-column label="提交时间" width="150">
        <template #default="scope">
          <div v-if="scope.row.latestSolution">
            {{  dayjs(scope.row.latestSolution.createdAt).format('L LT') }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="latestSolution.status" label="题目状态" width="120" />
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button v-if="scope.row.latestSolution?.status" link type="primary" size="small" @click="opendrawer(scope.row)">
            查看详情
          </el-button>
          <el-button v-else link type="primary" size="small" @click="toExercise(scope.row.id)">
            去完成
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-drawer v-model="drawer" :with-header="false">
      <h2>题目:</h2>
      <el-row>
        <el-col :span="20" v-if="exercise">
          <h3>{{ exercise.title }}</h3>
        </el-col>
        <el-col :span="4">
          <p style="text-align: center">ID: {{ exercise?.id }}</p>
        </el-col>
      </el-row>
      <el-text v-if="exercise" margin-top="20px">
        <p style="font-size: 15px">{{ exercise.content }}</p>
      </el-text>
      <h2>你的答案:</h2>
      <el-text v-if="solution" margin-top="20px">
        <p style="font-size: 15px">{{ solution.content }}</p>
        <div v-if="solution.imageUrls">
          <img
            v-for="(url, index) in solution.imageUrls"
            :key="index"
            :src="url"
            width="100%"
            height="auto"
          />
        </div>
        <!-- <img v-if="solution.imageUrls" :src="solution.imageUrls" width="400px", height="250px"> -->
      </el-text>
      <el-text v-else>
        <p>未完成</p>
      </el-text>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
  import dayjs from 'dayjs';
  import type { Exercise, Solution } from '~/types'
  import { listExercise, listSolution } from '~/util/db'

  const drawer = ref(false)
  const exercise = ref<Exercise>()
  const solution = ref<Solution>()
  const userStore = useUserStore()
  const combinedData = ref<ExerciseWithSolution[]>([])
  const router = useRouter()

  type ExerciseWithSolution = Exercise & {
    latestSolution?: Solution
  }

  onMounted(() => {
    watchEffect(async () => {
      if (!userStore.userInfo?.id) return
      const exercises = await listExercise()
      const solutions = await listSolution(userStore.userInfo.id)
      combinedData.value = exercises.map((exercise) => {
        const solution = solutions
          .filter((solution) => solution.exerciseId === exercise.id)
          .sort((a, b) => b.createdAt - a.createdAt)
        return {
          ...exercise,
          latestSolution: solution[0],
        }
      })

      console.log('Combined Data:', combinedData.value)
    })
  })

  const opendrawer = (data: ExerciseWithSolution) => {
    drawer.value = true
    exercise.value = data
    solution.value = data.latestSolution
  }

  function toExercise(id: number) {
    router.push({
      path: '/exercise',
      query: { id: id },
    })
  }
</script>

<style></style>
