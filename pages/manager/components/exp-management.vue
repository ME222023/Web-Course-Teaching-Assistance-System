<template>
  <div>
    <el-table v-loading="loading" :data="exercises" class="mt-4 w-10 !max-w-240">
      <el-table-column prop="title" label="实验名称" min-width="160" fixed></el-table-column>
      <el-table-column prop="creatorId" label="用户ID" min-width="80"></el-table-column>
      <el-table-column prop="createdAt" label="发布时间" min-width="160">
        <template #default="{ row }">
          <el-tooltip :content="formatDate(row.createdAt)" placement="top">
            <el-link underline>
              {{ formatDate(row.createdAt) }}
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
          <el-button type="danger" @click="onDeleteEercises(row.id)">删除</el-button>
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

<script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { deleteExercises, editEercises, listExercises } from '~/util/db'
  import type { Exercise } from '~/types'

  export default defineComponent({
    setup() {
      const loading = ref(false)
      const exercises = ref<any[]>([])

      const editExerciseId = ref<number>()
      const editExerciseForm = ref({
        // TODO2 : 初始化表单内容修改
        title: '',
        content: '',
      })

      console.log('exercises', exercises.value)

      async function fetchEercises() {
        try {
          exercises.value = await listExercises()
        } catch (error) {
          ElMessage.error('删除实验失败')
        }
      }

      async function onDeleteEercises(id: number) {
        try {
          await deleteExercises(id)
          ElMessage.success('删除实验成功')
          fetchEercises()
        } catch (error) {
          ElMessage.error('删除实验失败')
        }
      }

      //   onSubmitEditExercise
      async function onSubmitEditExercise() {
        try {
            console.log('onSubmitEditExercise : editExerciseForm', editExerciseForm.value)
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
          await editEercises({
            //TODO3 ： 扩充实验编辑的逻辑
            id: editExerciseId.value,
            title: editExerciseForm.value.title,
            content: editExerciseForm.value.content,
          })
          ElMessage.success('编辑实验成功')
          fetchEercises()
          editExerciseId.value = undefined
        } catch (error) {
          ElMessage.error('编辑实验失败')
        }
      }

      function onClickEditExercise(exercise: Exercise) {
        editExerciseId.value = exercise.id
        // TODO4 : 扩充初始化表单的内容
        editExerciseForm.value = { title: exercise.title, content: exercise.content }
      }

      function getAllExercises(): Promise<any[]> {
        return new Promise((resolve, reject) => {
          const dbName = 'weboj-db'
          const dbVersion = 11
          let db: IDBDatabase | null = null

          const request = indexedDB.open(dbName, dbVersion)

          request.onsuccess = (event: Event) => {
            db = (event.target as IDBOpenDBRequest).result

            const transaction = db.transaction(['exercises'], 'readonly')
            const objectStore = transaction.objectStore('exercises')

            const getAllRequest = objectStore.getAll()

            getAllRequest.onsuccess = (event: Event) => {
              resolve((event.target as IDBRequest).result)
            }
            console.log('getAllRequest1', getAllRequest)

            getAllRequest.onerror = (event: Event) => {
              reject((event.target as IDBRequest).error)
            }
          }

          console.log('getAllRequest2')

          request.onerror = (event: Event) => {
            reject((event.target as IDBOpenDBRequest).error)
          }
        })
      }

      onMounted(async () => {
        loading.value = true
        try {
          await fetchEercises()

          //console.log('exercises 2', exercises.value) trial
        } catch (error) {
          ElMessage.error('Failed to load exercises')
        } finally {
          loading.value = false
        }
      })

      const formatDate = (date: string | number | Date) => {
        return new Date(date).toLocaleString()
      }

      const editExercise = (id: number) => {
        // 需要实现编辑逻辑
        console.log('编辑:', id)
      }

      const deleteExercise = (id: number) => {
        // 需要实现删除逻辑
        console.log('删除:', id)
      }

      return {
        loading,
        exercises,
        formatDate,
        editExercise,
        deleteExercise,
        onDeleteEercises,
        onClickEditExercise,
        editExerciseId,
        editExerciseForm,
        onSubmitEditExercise
      }
    },
  })
</script>

<style scoped>
  .mt-4 {
    margin-top: 1rem;
  }
  .w-10 {
    width: 100%;
  }
</style>
