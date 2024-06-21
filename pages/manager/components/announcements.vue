<template>
  <div class="flex flex-col mx-10 pb-10 min-w-120 gap-6">
    <div class="flex items-center">
      <div class="text-lg">站点公告管理</div>
      <el-button class="ml-auto" type="primary" :icon="ElIconPlus" @click="onClickAddAnnouncement">
        新增公告
      </el-button>
    </div>

    <el-empty v-if="!announcements.length" description="暂无公告"></el-empty>

    <div v-for="announcement in announcements" :key="announcement.id">
      <el-card shadow="hover">
        <template #header>
          <div class="flex items-center">
            <div class="flex flex-col grow">
              <el-input
                v-if="editAnnouncementId === announcement.id"
                v-model="editAnnouncementForm.title"
                placeholder="公告标题"
                maxlength="100"
                show-word-limit
                clearable
              />
              <template v-else>
                <div class="text-lg">{{ announcement.title }}</div>
                <div class="text-sm text-gray-500">
                  {{ dayjs(announcement.createdAt).format('L LT') }}
                </div>
              </template>
            </div>
            <div class="ml-4" v-if="editAnnouncementId === announcement.id">
              <el-button type="primary" @click="submitEditAnnouncement"> 提交 </el-button>
              <el-button @click="editAnnouncementId = undefined"> 取消 </el-button>
            </div>
            <template v-else>
              <el-button
                class="ml-auto"
                type="primary"
                :icon="ElIconEdit"
                link
                @click="onClickEditAnnouncement(announcement)"
              >
                编辑
              </el-button>
              <el-popconfirm
                title="是否要删除此公告？"
                @confirm="onDeleteAnnouncement(announcement.id)"
              >
                <template #reference>
                  <el-button type="danger" :icon="ElIconDelete" link>删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </div>
        </template>
        <el-input
          v-if="editAnnouncementId === announcement.id"
          v-model="editAnnouncementForm.content"
          type="textarea"
          placeholder="公告内容"
          :rows="6"
          maxlength="1000"
          show-word-limit
          clearable
        />
        <el-scrollbar v-else wrap-class="max-h-40 whitespace-break-spaces">
          {{ announcement.content }}
        </el-scrollbar>
      </el-card>
    </div>

    <el-dialog v-model="showDialog" title="新增公告">
      <el-form
        ref="editAnnouncementFormRef"
        :model="editAnnouncementForm"
        :rules="editAnnouncementRules"
        label-position="top"
      >
        <el-form-item prop="title" label="公告标题" required>
          <el-input
            v-model="editAnnouncementForm.title"
            placeholder="标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item prop="content" label="公告内容" required>
          <el-input
            v-model="editAnnouncementForm.content"
            type="textarea"
            placeholder="请输入标题内容"
            :rows="6"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitNewAnnouncement"> 提交 </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance } from 'element-plus'
  import type { Announcement } from '~/types'
  import {
    addAnnouncement,
    deleteAnnouncement,
    editAnnouncement,
    listAnnouncement,
  } from '~/util/db'
  import { handleError } from '~/util/error_parser'
  import dayjs from '~/util/dayjs'

  const userStore = useUserStore()

  const announcements = ref<Announcement[]>([])
  const filterKeyword = ref('')
  const showDialog = ref(false)

  const editAnnouncementFormRef = ref<FormInstance>()
  // 假如 id 为 undefined，表示新增公告；否则表示编辑对应的公告
  const editAnnouncementId = ref<number>()
  const editAnnouncementForm = ref({
    title: '',
    content: '',
  })
  const editAnnouncementRules = {
    title: [{ required: true, message: '请输入公告标题', trigger: ['blur', 'change'] }],
    content: [{ required: true, message: '请输入公告内容', trigger: ['blur', 'change'] }],
  }

  async function fetchAnnouncements() {
    try {
      announcements.value = await listAnnouncement({ keyword: filterKeyword.value })
    } catch (error) {
      handleError('获取公告列表', error)
    }
  }

  async function submitNewAnnouncement() {
    if (!userStore.userInfo?.id) return
    const isValid = await editAnnouncementFormRef.value?.validate().catch(() => false)
    if (!isValid) return

    try {
      await addAnnouncement({ ...editAnnouncementForm.value, creatorId: userStore.userInfo.id })
      ElMessage.success('添加公告成功')
      fetchAnnouncements()
      showDialog.value = false
    } catch (error) {
      handleError('添加公告', error)
    }
  }

  async function submitEditAnnouncement() {
    if (!editAnnouncementId.value) return

    try {
      await editAnnouncement({
        ...editAnnouncementForm.value,
        id: editAnnouncementId.value,
      })
      ElMessage.success('编辑公告成功')
      fetchAnnouncements()
      showDialog.value = false
      editAnnouncementId.value = undefined
    } catch (error) {
      handleError('编辑公告', error)
    }
  }

  async function onDeleteAnnouncement(id: number) {
    try {
      await deleteAnnouncement(id)
      ElMessage.success('删除公告成功')
      fetchAnnouncements()
    } catch (error) {
      handleError('删除公告', error)
    }
  }

  function onClickEditAnnouncement(announcement: Announcement) {
    editAnnouncementId.value = announcement.id
    editAnnouncementForm.value = { title: announcement.title, content: announcement.content }
  }

  function onClickAddAnnouncement() {
    showDialog.value = true
    editAnnouncementId.value = undefined
    editAnnouncementForm.value = { title: '', content: '' }
  }

  onMounted(() => {
    fetchAnnouncements()
  })
</script>
