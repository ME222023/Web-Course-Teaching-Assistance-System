<template>
  <div class="flex flex-col ml-6 min-w-120 w-3/4 max-w-160">
    <div class="text-lg">用户管理</div>

    <el-table :data="users" class-name="mt-4 w-10">
      <el-table-column prop="username" label="用户名" fixed></el-table-column>
      <el-table-column prop="avatar" label="头像">
        <template #default="{ row }">
          <el-tooltip placement="top">
            <template #content>
              <img v-if="row.avatar" :src="row.avatar" style="width: 200px" />
              <div v-else>暂无头像</div>
            </template>
            <el-avatar :src="row.avatar" :icon="ElIconUser" size="small"></el-avatar>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" width="80"></el-table-column>
      <el-table-column prop="role" label="角色">
        <template #default="{ row }">
          <el-tag v-if="row.role === 'teacher'" type="primary">老师</el-tag>
          <el-tag v-else type="success">学生</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="注册时间">
        <template #default="{ row }">
          <el-tooltip :content="dayjs(row.createdAt).format('L LT')" placement="top">
            <el-link underline>
              {{ dayjs(row.createdAt).fromNow() }}
            </el-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100px">
        <template #default="{ row }">
          <el-button link size="small">TODO</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="mt-2 ml-auto"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      layout="sizes, prev, pager, next"
      :total="totalCount"
      :disabled="loading"
    ></el-pagination>
  </div>
</template>

<script setup lang="ts">
  import type { UserInfo } from '~/types'
  import { listUser } from '~/util/db'
  import { handleError } from '~/util/error_parser'
  import dayjs from '~/util/dayjs'

  const users = ref<UserInfo[]>([])
  const totalCount = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')

  watch([currentPage, pageSize, keyword], () => {
    fetchUsers()
  })

  const fetchUsers = useDebounceFn(async () => {
    loading.value = true
    try {
      const result = await listUser({
        keyword: keyword.value,
        page: currentPage.value,
        pageSize: pageSize.value,
      })
      users.value = result.users
      totalCount.value = result.total
    } catch (error) {
      handleError('获取用户列表', error)
    } finally {
      loading.value = false
    }
  }, 200)

  onMounted(() => {
    fetchUsers()
  })
</script>
