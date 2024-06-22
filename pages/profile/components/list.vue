<template>
  <div class="flex flex-col ml-6 mt-2 min-w-120 w-full max-w-400">
    <el-input
      v-model="input"
      style="max-width: 550px; padding: 10px"
      placeholder="输入要搜索的题目标题"
      class="input-with-select"
      @keyup.enter="searchToResult"
    >
      <template #append>
        <el-button :icon="Search" @click="searchToResult" />
      </template>
    </el-input>
    <el-table :data="combinedData1" style="width: 100%">
      <el-table-column prop="id" label="题目ID" width="100" />
      <el-table-column prop="title" label="题目标题" width="180" />
      <el-table-column label="提交时间" width="170">
        <template #default="scope">
          <div v-if="scope.row.latestSolution">
            {{ dayjs(scope.row.latestSolution.createdAt).format('L LT') }}
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button
            v-if="scope.row.latestSolution?.status"
            link
            type="primary"
            size="small"
            @click="opendrawer(scope.row)"
          >
            查看详情
          </el-button>
          <el-button v-else link type="primary" size="small" @click="toExercise(scope.row.id)">
            去完成
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-drawer class="min-w-120 !w-50vw max-w-200" v-model="drawer" :with-header="false">
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
        <div v-if="exercise.images?.length">
          <p>图片:</p>
          <el-image
            v-for="(url, index) in exercise.images"
            class="w-70% max-w-160 h-auto"
            :key="index"
            :src="url"
            :preview-src-list="exercise.images"
            :initial-index="index"
          />
        </div>
        <div v-if="exercise.audios?.length">
          <p>音频:</p>
          <audio
            v-for="(url, index) in exercise.audios"
            :key="index"
            :src="url"
            width="70%"
            height="auto"
            controls
          ></audio>
        </div>
        <div v-if="exercise.videos?.length">
          <p>视频:</p>
          <video
            v-for="(url, index) in exercise.videos"
            :key="index"
            :src="url"
            width="30%"
            height="auto"
            controls
          ></video>
        </div>
      </el-text>

      <h2>你的答案:</h2>
      <el-text v-if="solution" margin-top="20px">
        <div v-if="solution.content">
          <p>
            语言：{{
              EL_SELECT_MONACO_LANGUAGES.find((l) => l.value === solution?.language)?.label ??
              solution.language
            }}
          </p>
          <monaco-editor
            class="w-full h-100"
            :model-value="solution.content"
            :lang="solution.language"
            :options="{ theme: 'vs-dark', readOnly: true }"
          ></monaco-editor>
        </div>
        <div v-if="solution.imageUrls.length">
          <p>图片:</p>
          <el-image
            v-for="(url, index) in solution.imageUrls"
            class="w-70% max-w-160 h-auto"
            :key="index"
            :src="url"
            :preview-src-list="solution.imageUrls"
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
  import dayjs from 'dayjs'
  import { EL_SELECT_MONACO_LANGUAGES } from '~/constants'
  import type { Exercise, Solution } from '~/types'
  import { listExercises, listSolution } from '~/util/db'
  import { Search } from '@element-plus/icons-vue'

  type ExerciseWithSolution = Exercise & {
    latestSolution?: Solution
  }

  const drawer = ref(false)
  const exercise = ref<Exercise>()
  const solution = ref<Solution>()
  const userStore = useUserStore()
  const combinedData = ref<ExerciseWithSolution[]>([])
  const combinedData1 = ref<ExerciseWithSolution[]>([])
  const router = useRouter()
  const input = ref('')

  onMounted(() => {
    watchEffect(async () => {
      //初始化数据
      combinedData.value = []
      // console.log(combinedData.value)
      if (!userStore.userInfo?.id) return
      const exercises = await listExercises({ isPublished: true })
      const solutions = await listSolution({userId: userStore.userInfo.id})
      console.log(solutions)
      combinedData.value = exercises.map((exercise) => {
        const solution = solutions
          .filter((solution) => solution.exerciseId === exercise.id)
          .sort((a, b) => b.createdAt - a.createdAt)
        // console.log(solution)
        return {
          ...exercise,
          latestSolution: solution[0],
        }
      })
      combinedData1.value = combinedData.value
      console.log('Combined Data:', combinedData.value)
    })
  })

  const opendrawer = async (data: ExerciseWithSolution) => {
    drawer.value = true
    exercise.value = data
    solution.value = data.latestSolution
    console.log(solution.value?.imageUrls)
    // solution.value = await getSolutionById(Number(data.latestSolution?.id))
  }

  function toExercise(id: number) {
    router.push({
      path: '/exercise',
      query: { id: id },
    })
  }

  function searchToResult() {
    if (input.value === '') {
      combinedData1.value = combinedData.value
      return
    }
    combinedData1.value = combinedData.value.filter((item) => item.title.includes(input.value))
  }
</script>

<style></style>
