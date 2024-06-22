<template>
  <div>
    <el-dialog class="!w-3/4 !max-w-200 !min-w-100" v-model="showDialog" title="实验完成情况">
      <el-empty v-if="!solutions.length" description="暂无数据"></el-empty>
      <el-table v-else class="w-full" :data="solutions" border>
        <el-table-column type="expand">
          <template #default="{ row: solution }">
            <el-card shadow="never">
              <div v-if="solution.imageUrls.length" class="flex items-center flex-wrap gap-2">
                <el-image
                  v-for="(image, key) in solution.imageUrls"
                  class="w-30 h-30 rounded-xl"
                  fit="cover"
                  :key
                  :src="image"
                  :preview-src-list="solution.imageUrls"
                  :initial-index="key"
                ></el-image>
              </div>

              <monaco-editor
                v-if="solution.content"
                class="mt-4 h-100"
                :model-value="solution.content"
                :lang="solution.language"
                :options="{ readOnly: true, theme: 'vs-dark' }"
              ></monaco-editor>
            </el-card>
          </template>
        </el-table-column>
        <el-table-column label="用户名">
          <template #default="{ row: solution }">
            <span>{{ solution.creator.nickname ?? solution.creator.username }}</span>
          </template>
        </el-table-column>
        <el-table-column label="语言" prop="language"></el-table-column>
        <el-table-column label="提交时间" prop="createdAt">
          <template #default="{ row: solution }">
            <span>{{ dayjs(solution.createdAt).format('L LT') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import type { Solution, User } from '~/types'
  import { getUser, listSolution } from '~/util/db'
  import { handleError } from '~/util/error_parser'
  import dayjs from '~/util/dayjs'

  const showDialog = ref(false)
  const solutions = ref<Array<Solution & { creator: User }>>([])

  defineExpose({
    show(exerciseId: number) {
      showDialog.value = true
      fetchSolutions(exerciseId)
    },
  })

  async function fetchSolutions(exerciseId: number) {
    try {
      solutions.value = []
      const _solutions = await listSolution({ exerciseId })
      await Promise.all(
        _solutions.map(async (solution) => {
          const creator = await getUser(solution.creatorId)
          solutions.value.push({ ...solution, creator })
        }),
      )
    } catch (error) {
      handleError('获取提交记录', error)
    }
  }
</script>
