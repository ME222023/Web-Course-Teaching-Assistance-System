<template>
  <div>
    <el-table v-loading="loading" :data="exercises" class="mt-4 w-10 !max-w-240">
      <el-table-column prop="title" label="实验名称" min-width="160" fixed></el-table-column>
      <el-table-column prop="creatorId" label="用户ID" min-width="80">
        <template #default="{ row }">
          <el-link>{{ row.creator.nickname ?? row.creator.id }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="发布时间" min-width="160">
        <template #default="{ row }">
          <el-tooltip :content="dayjs(row.createdAt).format('L LT')" placement="top">
            <el-link underline>
              {{ dayjs(row.createdAt).fromNow() }}
            </el-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="isPublished" label="发布状态" min-width="100">
        <template #default="{ row }">
          <el-tag v-if="row.isPublished" type="success">已发布</el-tag>
          <el-tag v-else type="danger">未发布</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="300px">
        <template #default="{ row }">
          <el-button @click="exerciseDetailDialogRef?.show(row.id)">学生提交情况</el-button>
          <el-button type="primary" @click="onClickEditExercise(row)">编辑</el-button>
          <el-button type="danger" @click="showDeleteDialog(row.id)">删除</el-button>
          <el-button v-if="row.isPublished" type="primary" @click="onClickwdExercise(row.id)">
            撤回
          </el-button>
          <el-button v-else type="primary" @click="onClickRepostExercise(row.id)">发布</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗模块 -->
    <el-dialog v-model="showEditExerciseDialog" title="编辑实验" width="600px">
      <ExperimentForm
        :initialForm="editExerciseForm"
        @submit="onSubmitEditExercise"
        @reset="onResetEditExercise"
      />
      <template #footer>
        <el-button @click="onCancelEditExercise()">取消</el-button>
        <el-button type="primary" @click="onSubmitEditExercise">确定</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认 dialog -->
    <el-dialog v-model="showDeleteDialogVisible" title="确认删除" width="300px">
      <span>确定要删除此实验吗？</span>
      <template #footer>
        <el-button @click="showDeleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteExercise">确认</el-button>
      </template>
    </el-dialog>

    <!-- 实验提交情况 dialog -->
    <exercise-detail-dialog ref="exerciseDetailDialogRef" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    deleteExercises,
    editExercises,
    getUser,
    listExercises,
    withdrawExercises,
    repostExercises,
  } from '~/util/db'
  import type { Exercise, User } from '~/types'
  import dayjs from '~/util/dayjs'
  import { handleError } from '~/util/error_parser'
  import ExerciseDetailDialog from './exercise-detail-dialog.vue'
  import ExperimentForm from './ExperimentForm-manage.vue'

  interface ExerciseWithCreator extends Exercise {
    creator: User
  }

  const loading = ref(false)
  const exercises = ref<ExerciseWithCreator[]>([])

  const showEditExerciseDialog = ref(false)
  const editExerciseId = ref<number | undefined>()
  const editExerciseForm = ref({
    title: '',
    content: '',
    images: [] as string[],
    audios: [] as string[],
    videos: [] as string[],
  })

  const exerciseDetailDialogRef = ref<InstanceType<typeof ExerciseDetailDialog>>()

  // 删除确认对话框的状态
  const showDeleteDialogVisible = ref(false)
  const deleteExerciseId = ref<number | undefined>()

  onMounted(async () => {
    loading.value = true
    try {
      await fetchExercises()
    } catch (error) {
      ElMessage.error('加载实验失败')
    } finally {
      loading.value = false
    }
  })

  const fetchExercises = async () => {
    try {
      exercises.value = []
      const _exercises = await listExercises()
      const exercisesWithCreator: ExerciseWithCreator[] = []
      await Promise.all(
        _exercises.map(async (exercise) => {
          const creator = await getUser(exercise.creatorId)
          exercisesWithCreator.push({ ...exercise, creator })
        }),
      )
      exercises.value = exercisesWithCreator
    } catch (error) {
      handleError('获取实验列表', error)
    }
  }

  const showDeleteDialog = (id: number) => {
    deleteExerciseId.value = id
    showDeleteDialogVisible.value = true
  }

  const confirmDeleteExercise = async () => {
    if (deleteExerciseId.value) {
      try {
        await deleteExercises(deleteExerciseId.value)
        ElMessage.success('删除实验成功')
        await fetchExercises()
      } catch (error) {
        handleError('删除实验', error)
      } finally {
        showDeleteDialogVisible.value = false
      }
    }
  }

  const onCancelEditExercise = () => {
    editExerciseId.value = undefined
    showEditExerciseDialog.value = false
  }

  const onSubmitEditExercise = async () => {
    try {
      if (!editExerciseForm.value.title) {
        ElMessage.error('实验名称不能为空')
        return
      }
      if (!editExerciseForm.value.content) {
        ElMessage.error('实验内容不能为空')
        return
      }

      if (!editExerciseId.value) {
        ElMessage.error('编辑实验id不存在')
        return
      }
      await editExercises({
        id: editExerciseId.value,
        title: editExerciseForm.value.title,
        content: editExerciseForm.value.content,
        images: editExerciseForm.value.images,
        audios: editExerciseForm.value.audios,
        videos: editExerciseForm.value.videos,
      })
      ElMessage.success('编辑实验成功')
      await fetchExercises()
      editExerciseId.value = undefined
      showEditExerciseDialog.value = false
    } catch (error) {
      handleError('编辑实验', error)
    }
  }

  const onClickEditExercise = (exercise: Exercise) => {
    editExerciseId.value = exercise.id
    showEditExerciseDialog.value = true
    editExerciseForm.value = {
      title: exercise.title,
      content: exercise.content,
      images: exercise.images || [],
      audios: exercise.audios || [],
      videos: exercise.videos || [],
    }
  }

  const onClickwdExercise = async (id: number) => {
    if (id) {
      try {
        await withdrawExercises(id)
        ElMessage.success('撤回实验成功')
        const exercise = exercises.value.find((exercise) => exercise.id === id)
        if (exercise) {
          exercise.isPublished = 0
        }
      } catch (error) {
        handleError('撤回实验', error)
      }
    }
  }

  const onClickRepostExercise = async (id: number) => {
    if (id) {
      try {
        await repostExercises(id)
        ElMessage.success('发布实验成功')
        const exercise = exercises.value.find((exercise) => exercise.id === id)
        if (exercise) {
          exercise.isPublished = 1
        }
      } catch (error) {
        handleError('发布实验', error)
      }
    }
  }

  const onResetEditExercise = () => {
    editExerciseForm.value = {
      title: '',
      content: '',
      images: [],
      audios: [],
      videos: [],
    }
    showEditExerciseDialog.value = false
  }
</script>

<style scoped>
  .mt-4 {
    margin-top: 1rem;
  }
  .w-10 {
    width: 100%;
  }
</style>
