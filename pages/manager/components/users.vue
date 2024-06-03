<template>
  <div class="flex flex-col xl:flex-row ml-10 min-w-120 gap-6">
    <!-- 用户设置，大屏上显示在屏幕右侧，小屏上显示在顶部 -->
    <div class="flex flex-col xl:order-last">
      <div class="text-lg">全局设置</div>

      <el-form class="mt-4" label-position="left" label-width="100px">
        <el-form-item label="启用注册">
          <el-switch
            v-model="configStore.siteConfig.registerEnabled"
            active-text="开"
            inactive-text="关"
            @change="ElMessage.success('设置已保存')"
          />
        </el-form-item>
      </el-form>
    </div>
    <!-- 用户列表 -->
    <div class="flex flex-col">
      <div class="text-lg">用户管理</div>

      <!-- 筛选表单 -->
      <div class="flex mb-1 mt-4 gap-2">
        <el-select-v2
          class="!w-40"
          v-model="filterRole"
          placeholder="筛选用户类型"
          :options="filterRoleOptions"
          clearable
          default-first-option
        ></el-select-v2>
        <el-input
          class="!w-40"
          v-model="keyword"
          placeholder="筛选用户名/昵称"
          clearable
          @change="listUser()"
          @keydown.enter="listUser()"
        ></el-input>
      </div>

      <el-table v-loading="loading" :data="users" class-name="mt-4 w-10 !max-w-240">
        <el-table-column prop="username" label="用户名" min-width="160" fixed></el-table-column>
        <el-table-column prop="avatar" label="头像" min-width="80">
          <template #default="{ row }">
            <el-tooltip placement="top">
              <template #content>
                <el-image v-if="row.avatar" :src="row.avatar" style="width: 200px" />
                <div v-else>暂无头像</div>
              </template>
              <el-avatar :src="row.avatar" :icon="ElIconUser" size="small"></el-avatar>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="160"></el-table-column>
        <el-table-column prop="role" label="角色" min-width="100">
          <template #default="{ row }">
            <el-tag v-if="row.role === 'teacher'" type="primary">老师</el-tag>
            <el-tag v-else type="success">学生</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" min-width="120">
          <template #default="{ row }">
            <el-tooltip :content="dayjs(row.createdAt).format('L LT')" placement="top">
              <el-link underline>
                {{ dayjs(row.createdAt).fromNow() }}
              </el-link>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="300px">
          <template #default="{ row }">
            <!-- 只能对别人进行操作 -->
            <template v-if="row.id !== userStore.userInfo?.id">
              <!-- 切换身份 -->
              <el-popconfirm
                :title="`是否要切换此用户的身份为${row.role === 'teacher' ? '学生' : '老师'}？`"
                width="200"
                placement="top"
                @confirm="onClickToggleUserRole(row)"
              >
                <template #reference>
                  <el-button type="primary" link>
                    {{ row.role === 'teacher' ? '转为学生' : '转为老师' }}
                  </el-button>
                </template>
              </el-popconfirm>

              <!-- 重置密码 -->
              <el-popconfirm
                title="是否要重置此用户的密码？"
                width="200"
                placement="top"
                @confirm="onClickResetPassword(row.id)"
              >
                <template #reference>
                  <el-button type="primary" link> 重置密码 </el-button>
                </template>
              </el-popconfirm>
              <!-- 禁用用户 -->
              <el-popconfirm
                :title="`是否要${row.isDisabled ? '启用' : '禁用'}此用户？`"
                width="200"
                placement="top"
                @confirm="onClickToggleUserIsDisabled(row)"
              >
                <template #reference>
                  <el-button :type="row.isDisabled ? 'success' : 'warning'" link>
                    {{ row.isDisabled ? '启用' : '禁用' }}
                  </el-button>
                </template>
              </el-popconfirm>
              <!-- 删除用户 -->
              <el-popconfirm
                title="是否要删除此用户？"
                width="200"
                placement="top"
                confirm-button-type="danger"
                @confirm="onClickDeleteUser(row.id)"
              >
                <template #reference>
                  <el-button type="danger" link> 删除 </el-button>
                </template>
              </el-popconfirm>
            </template>
            <div v-else class="text-gray">不能操作自己</div>
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
  </div>
</template>

<script setup lang="ts">
  import type { UserInfo, UserRole } from '~/types'
  import {
    disableUser,
    enableUser,
    listUser,
    resetPassword,
    deleteUser,
    updateUserInfo,
  } from '~/util/db'
  import { handleError } from '~/util/error_parser'
  import dayjs from '~/util/dayjs'

  const configStore = useConfigStore()
  const userStore = useUserStore()

  const users = ref<UserInfo[]>([])
  const totalCount = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')
  const filterRole = ref<UserRole>()

  const filterRoleOptions = [
    { label: '全部用户', value: undefined },
    { label: '仅学生', value: 'student' },
    { label: '仅老师', value: 'teacher' },
  ]

  watch([currentPage, pageSize, keyword, filterRole], () => {
    fetchUsers()
  })

  const fetchUsers = useDebounceFn(async () => {
    loading.value = true
    try {
      const result = await listUser({
        keyword: keyword.value,
        page: currentPage.value,
        pageSize: pageSize.value,
        role: filterRole.value,
      })
      users.value = result.users
      totalCount.value = result.total
    } catch (error) {
      handleError('获取用户列表', error)
    } finally {
      loading.value = false
    }
  }, 200)

  async function onClickResetPassword(userId: number) {
    try {
      await resetPassword(userId)
      ElMessage.success({
        duration: 8000,
        message: '此用户的密码已被重置为用户名，请通知其尽快修改密码',
      })
    } catch (error) {
      handleError('重置密码', error)
    }
  }

  async function onClickToggleUserIsDisabled(user: UserInfo) {
    try {
      if (user.isDisabled) await enableUser(user.id)
      else await disableUser(user.id)
      ElMessage.success('操作成功')
      fetchUsers()
    } catch (error) {
      handleError('操作用户', error)
    }
  }

  async function onClickToggleUserRole(user: UserInfo) {
    try {
      if (user.role === 'teacher') await updateUserInfo(user.id, { role: 'student' })
      else await updateUserInfo(user.id, { role: 'teacher' })
      ElMessage.success('操作成功')
      fetchUsers()
    } catch (error) {
      handleError('操作用户', error)
    }
  }

  async function onClickDeleteUser(userId: number) {
    try {
      console.log('删除用户', userId)
      await deleteUser(userId)
      ElMessage.success('删除成功')
      console.log('删除用户成功')

      fetchUsers()
    } catch (error) {
      handleError('删除用户', error)
    }
  }

  onMounted(() => {
    fetchUsers()
  })
</script>
