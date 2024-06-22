<template>
  <div>
    <el-table v-loading="loading" :data="exercises" class="mt-4 w-10 !max-w-240">
      <el-table-column prop="title" label="实验名称" min-width="160" fixed></el-table-column>
      <el-table-column prop="creatorId" label="用户ID" min-width="80"></el-table-column>
      <el-table-column prop="createdAt" label="发布时间" min-width="160">
        <template #default="{ row }">
          <el-tooltip :content="dayjs(row.createdAt).format('L LT')" placement="top">
            <el-link underline>
              {{ dayjs(row.createdAt).fromNow() }}
            </el-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="published" label="发布状态" min-width="100">
        <template #default="{ row }">
          <el-tag v-if="row.published" type="success">已发布</el-tag>
          <el-tag v-else type="danger">未发布</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="300px">
        <template #default="{ row }">
          <el-button type="primary" @click="onClickEditExercise(row)">编辑</el-button>
          <el-button type="danger" @click="onDeleteExercises(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- TODO1. 增加更多的弹窗模块 -->
    <el-dialog v-model="editExerciseId" title="编辑实验" width="600px">
      <el-form :model="editExerciseForm" label-width="100px">
        <el-form-item label="实验名称">
          <el-input v-model="editExerciseForm.title" placeholder="实验名称"></el-input>
        </el-form-item>
        <el-form-item label="实验内容"></el-form-item>
        <el-input
          v-model="editExerciseForm.content"
          type="textarea"
          :rows="10"
          placeholder="实验内容"
        ></el-input>
      </el-form>
      <template #footer>
        <!--editExerciseId是一个ref对象，实现同步更新-->
        <el-button @click="editExerciseId = undefined">取消</el-button>
        <el-button type="primary" @click="onSubmitEditExercise">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { deleteExercises, editExercises, listExercises } from '~/util/db'
  import type { Exercise } from '~/types'
  import dayjs from '~/util/dayjs'

  const loading = ref(false)
  const exercises = ref<Exercise[]>([])

  const editExerciseId = ref<number | undefined>()
  const editExerciseForm = ref({
    title: '',
    content: '',
  })

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
      exercises.value = await listExercises()
    } catch (error) {
      ElMessage.error('获取实验列表失败')
    }
  }

  const onDeleteExercises = async (id: number) => {
    try {
      await deleteExercises(id)
      ElMessage.success('删除实验成功')
      await fetchExercises()
    } catch (error) {
      ElMessage.error('删除实验失败')
    }
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
      })
      ElMessage.success('编辑实验成功')
      await fetchExercises()
      editExerciseId.value = undefined
    } catch (error) {
      ElMessage.error('编辑实验失败')
    }
  }

  const onClickEditExercise = (exercise: Exercise) => {
    editExerciseId.value = exercise.id
    editExerciseForm.value = { title: exercise.title, content: exercise.content }
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
