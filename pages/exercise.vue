<template>
  <div class="flex" style="height: calc(100vh - 80px)">
    <el-col class="!overflow-y-auto !overflow-x-hidden" :span="5">
      <el-input
        class="!sticky !top-0 !pt-2 !bg-white z-1"
        v-model="searchKeyword"
        style="max-width: 550px; padding: 10px"
        placeholder="输入要搜索的题目标题"
        @keyup.enter="fetchExercises"
      >
        <template #append>
          <el-button :icon="Search" @click="fetchExercises" />
        </template>
      </el-input>
      <div class="flex flex-col">
        <el-row
          v-for="exercise in exercises"
          class="py-2 mr-2 !cursor-pointer hover:bg-gray-100 rounded-1 transition-all"
          :key="exercise.id"
          @click="changeExercise(exercise.id)"
        >
          <el-col class="!flex !items-center" :span="exercise.hasSolution ? 20 : 21" :offset="1">
            <el-text
              :type="selectedExercise?.id === exercise.id ? 'primary' : undefined"
              line-clamp="1"
            >
              {{ exercise.id }}. {{ exercise.title }}
            </el-text>
          </el-col>
          <el-col v-if="exercise.hasSolution" class="!flex !items-center" :span="1" :offset="1">
            <el-tooltip content="已提交" placement="right">
              <el-icon>
                <el-icon-circle-check-filled
                  v-if="exercise.hasSolution"
                  class="text-green font-bold"
                />
              </el-icon>
            </el-tooltip>
          </el-col>
        </el-row>
      </div>
    </el-col>
    <!-- 实验详情 -->
    <el-col v-loading="loadingFetchExercise" class="!overflow-y-auto px-10" :span="19">
      <div v-if="selectedExercise" class="flex flex-col">
        <div class="flex items-center">
          <h2>{{ selectedExercise.title }}</h2>
          <span class="ml-auto">ID: {{ selectedExercise.id }}</span>
        </div>
        <el-text class="w-full" margin-top="20px">
          <p class="whitespace-break-spaces">{{ selectedExercise.content }}</p>
          <div class="flex flex-col gap-y-2" v-if="selectedExercise.images?.length">
            <p>图片:</p>
            <el-image
              v-for="(url, index) in selectedExercise.images"
              class="w-70% max-w-160 h-auto"
              :key="index"
              :src="url"
              :preview-src-list="selectedExercise.images"
              :initial-index="index"
            />
          </div>
          <div v-if="selectedExercise.audios?.length">
            <p>音频:</p>
            <audio
              v-for="(url, index) in selectedExercise.audios"
              :key="index"
              :src="url"
              width="70%"
              height="auto"
              controls
            ></audio>
          </div>
          <div v-if="selectedExercise.videos?.length">
            <p>视频:</p>
            <video
              v-for="(url, index) in selectedExercise.videos"
              :key="index"
              :src="url"
              width="30%"
              height="auto"
              controls
            ></video>
          </div>
          <template v-if="userStore.userInfo && !selectedExercise.hasSolution">
            <el-card class="mt-4" shadow="never">
              <el-form class="!flex !items-center" label-position="left">
                <el-form-item label="编辑器主题">
                  <el-select-v2
                    class="!w-50"
                    v-model="editorTheme"
                    :options="EL_SELECT_MONACO_THEMES"
                  ></el-select-v2>
                </el-form-item>
                <el-form-item class="ml-4" label="语言">
                  <el-select-v2
                    class="!w-40"
                    v-model="solution.language"
                    :options="EL_SELECT_MONACO_LANGUAGES"
                    filterable
                  ></el-select-v2>
                </el-form-item>
              </el-form>
              <monaco-editor
                ref="monacoEditorRef"
                class="w-full h-100"
                v-model="solution.content"
                :lang="solution.language"
                :options="{ theme: editorTheme }"
              ></monaco-editor>
              <p class="my-2">上传图片回答</p>
              <el-upload
                class="uploadpng"
                drag
                action="#"
                method="get"
                multiple
                list-type="picture"
                :on-error="onUploadFileError"
                :on-success="onFileChange"
                accept="image/*"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text"> Drop file here or <em>click to upload</em> </div>
              </el-upload>
            </el-card>
            <el-button class="mt-4" type="primary" @click="submit"> 提交 </el-button>
          </template>
          <el-alert
            v-else-if="!userStore.userInfo"
            class="!my-6"
            type="error"
            :closable="false"
            show-icon
          >
            <template #title>
              请先
              <el-text
                class="cursor-pointer select-none"
                type="primary"
                @click="$router.push('/login')"
              >
                登录
              </el-text>
              后再提交答案
            </template>
          </el-alert>
          <el-alert
            v-else-if="selectedExercise.hasSolution"
            class="!my-6"
            type="success"
            :closable="false"
            show-icon
          >
            <template #title>
              已提交过答案，不可重复提交。
              <el-text
                class="cursor-pointer select-none"
                type="primary"
                @click="$router.push('/profile')"
              >
                查看完成情况
              </el-text>
            </template>
          </el-alert>
        </el-text>
      </div>

      <el-empty
        v-else
        class="mt-10"
        :image="ExercisePlaceholderWebP"
        description="选择一个题目，开始做题吧"
      ></el-empty>
    </el-col>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElMessage, type UploadFile, type UploadFiles, type UploadProps } from 'element-plus'
  import {
    isSubmitted,
    getExerciseById,
    listExercises,
    addSolution,
    getSolutionByExerciseId,
  } from '~/util/db'
  import type { Exercise, Solution } from '~/types'
  import { SolutionStatus } from '~/types'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { convertFileToBase64 } from '~/util/files'
  import ExercisePlaceholderWebP from '~/assets/icons/exercise-placeholder.webp'
  import type MonacoEditor from 'nuxt-monaco-editor/dist/runtime/MonacoEditor.client.vue'
  import { MonacoPlaceholderContentWidget } from '~/util/monaco-editor'
  import { EL_SELECT_MONACO_LANGUAGES, EL_SELECT_MONACO_THEMES } from '~/constants'
  import { Search } from '@element-plus/icons-vue'
  import { handleError } from '~/util/error_parser'

  type ExerciseListValueWithSolution = Pick<Exercise, 'id' | 'title' | 'content'> & {
    hasSolution?: boolean
  }
  interface ExerciseWithSolution extends Exercise {
    hasSolution?: boolean
  }

  const userStore = useUserStore()
  const route = useRoute()
  const router = useRouter()
  const selectedExercise = ref<ExerciseWithSolution>()
  const exercises = ref<ExerciseListValueWithSolution[]>([])
  const searchKeyword = ref('')
  let base64: string[] = []

  const solution = ref<Solution>({
    id: 0,
    exerciseId: 0,
    creatorId: 0,
    content: '',
    language: 'plaintext',
    createdAt: Date.now(),
    imageUrls: [],
    status: SolutionStatus.Pending,
    isDeleted: 0,
  })
  const monacoEditorRef = ref<InstanceType<typeof MonacoEditor>>()
  const editorTheme = ref('vs-dark')
  const loadingFetchExercise = ref(false)

  onMounted(async () => {
    const stopWatchUserInfo = watchEffect(() => {
      nextTick(() => {
        stopWatchUserInfo()
        fetchExercises()
      })
    })
    watch(
      () => route.query.id,
      async (exerciseId) => {
        if (!exerciseId) return
        fetchExercise(Number(exerciseId))
      },
      { immediate: true },
    )
    // 编辑器加载成功后，添加 placeholder 提示
    const stopWatchEditor = watchEffect(() => {
      if (!monacoEditorRef.value?.$editor) return
      new MonacoPlaceholderContentWidget('在此输入答案', monacoEditorRef.value.$editor)
      stopWatchEditor()
    })
  })

  const onFileChange = async (_: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    try {
      base64 = await convertFileToBase64(uploadFiles)
    } catch (error) {
      ElMessage.error('文件处理出错: ' + error)
    }
  }

  function changeExercise(id: number) {
    router.push({
      path: '/exercise',
      query: { id },
    })
  }

  async function submit() {
    if (!userStore.userInfo) {
      ElMessage.error('请先登录')
      return
    }
    //提交过的不能再提交
    if (await isSubmitted(Number(route.query.id), userStore.userInfo.id)) {
      ElMessage.error('已提交过答案')
      return
    }
    const exerciseId = Number(route.query.id)
    solution.value.createdAt = Date.now()
    solution.value.exerciseId = exerciseId
    solution.value.imageUrls = base64
    solution.value.creatorId = userStore.userInfo.id
    if (!solution.value.content && !solution.value.imageUrls.length) {
      ElMessage.error('答案不能为空')
      return
    }
    try {
      const solutionClone = JSON.parse(JSON.stringify(solution.value))

      await addSolution(solutionClone)
      ElMessage.success('提交成功')
      const exercise = exercises.value.find((exercise) => exercise.id === exerciseId)
      if (exercise) {
        exercise.hasSolution = true
        selectedExercise.value!.hasSolution = true
      }
    } catch (error) {
      handleError('提交', error)
    }
  }

  function onUploadFileError() {
    ElMessage.error('图片异常，请更换图片')
  }

  async function fetchExercise(id: number) {
    loadingFetchExercise.value = true
    try {
      const exercise: ExerciseWithSolution | undefined = await getExerciseById(id)
      if (!exercise) {
        ElMessage.error('题目不存在')
        loadingFetchExercise.value = false
        selectedExercise.value = undefined
        return
      }
      const userInfo = await userStore.userInfoLoaded()
      if (userInfo?.id) {
        exercise.hasSolution = !!(await getSolutionByExerciseId(id, userInfo.id))
      }
      selectedExercise.value = exercise
    } catch (error) {
      handleError('获取题目', error)
    } finally {
      loadingFetchExercise.value = false
    }
  }

  async function fetchExercises() {
    try {
      exercises.value = (
        await listExercises({ keyword: searchKeyword.value, isPublished: true })
      ).map((exercise) => ({ ...exercise, hasSolution: false }))
      const userInfo = await userStore.userInfoLoaded()
      if (userInfo?.id) {
        exercises.value.forEach(async (exercise) => {
          try {
            exercise.hasSolution = !!(await getSolutionByExerciseId(
              exercise.id,
              userStore.userInfo!.id,
            ))
          } catch (error) {
            handleError(`获取题目 ${exercise.id} 答案`, error)
          }
        })
      }
    } catch (error) {
      handleError('获取实验列表', error)
    }
  }
</script>

<style></style>
