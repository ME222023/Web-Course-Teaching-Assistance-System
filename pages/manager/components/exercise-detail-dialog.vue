<template>
  <div>
    <el-dialog class="!w-3/4 !max-w-200 !min-w-100" v-model="showDialog" title="实验完成情况">
      <el-switch v-model="showCompletedOnly" active-text="只显示已提交" />
      <el-empty v-if="!completionInfo.length" description="暂无数据"></el-empty>
      <el-table v-else class="w-full" v-loading="loading" :data="completionInfo" border>
        <el-table-column type="expand">
          <template #default="{ row: data }">
            <el-card v-if="data.solution" shadow="never">
              <div v-if="data.solution.imageUrls.length" class="flex items-center flex-wrap gap-2">
                <el-image
                  v-for="(image, key) in data.solution.imageUrls"
                  class="w-30 h-30 rounded-xl"
                  fit="cover"
                  :key
                  :src="image"
                  :preview-src-list="data.solution.imageUrls"
                  :initial-index="key"
                ></el-image>
              </div>

              <monaco-editor
                v-if="data.solution.content"
                class="mt-4 h-100"
                :model-value="data.solution.content"
                :lang="data.solution.language"
                :options="{ readOnly: true, theme: 'vs-dark' }"
              ></monaco-editor>
            </el-card>
          </template>
        </el-table-column>
        <el-table-column label="昵称" prop="user.nickname"> </el-table-column>
        <el-table-column label="用户名" prop="user.username"> </el-table-column>
        <el-table-column label="提交状态">
          <template #default="{ row: data }">
            <el-tag v-if="data.solution" type="success">已提交</el-tag>
            <el-tag v-else type="danger">未提交</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="语言" prop="solution.language"></el-table-column>
        <el-table-column label="提交时间">
          <template #default="{ row }">
            <span v-if="row.solution">{{ dayjs(row.solution.createdAt).format('L LT') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import type { Solution, UserInfo } from '~/types'
  import { getSolutionByExerciseId, listUser } from '~/util/db'
  import { handleError } from '~/util/error_parser'
  import dayjs from '~/util/dayjs'

  interface ExerciseCompletionInfo {
    user: UserInfo
    solution?: Solution
  }
  const showDialog = ref(false)
  const exerciseId = ref(0)
  const completionInfo = ref<ExerciseCompletionInfo[]>([])
  const loading = ref(false)
  const showCompletedOnly = ref(true)

  defineExpose({
    show(_exerciseId: number) {
      showDialog.value = true
      exerciseId.value = _exerciseId
      fetchSolutions()
    },
  })

  watch(showCompletedOnly, () => {
    fetchSolutions()
  })

  async function fetchSolutions() {
    try {
      loading.value = true
      completionInfo.value = []
      const users = await listUser({ pageSize: 1000 })
      const result: ExerciseCompletionInfo[] = []
      await Promise.all(
        users.users.map(async (user) => {
          const solution = await getSolutionByExerciseId(exerciseId.value, user.id)
          result.push({ user, solution })
        }),
      )
      if (showCompletedOnly.value) {
        completionInfo.value = result.filter((item) => item.solution)
      } else {
        completionInfo.value = result
      }
    } catch (error) {
      handleError('获取提交记录', error)
    }
    loading.value = false
  }
</script>
