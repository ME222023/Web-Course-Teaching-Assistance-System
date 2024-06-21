<!-- 站点公告详情的弹窗 -->
<template>
  <el-dialog
    v-model="showDialog"
    title="站点公告"
    width="50%"
    :visible="showDialog"
    @close="showDialog = false"
  >
    <div class="flex flex-col gap-2">
      <div class="text-lg font-bold">{{ announcement.title }}</div>
      <div class="text-gray-500">
        {{ dayjs(announcement.createdAt).format('L LT') }}
      </div>
      <div class="text-gray-500 whitespace-break-spaces">{{ announcement.content }}</div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
  import type { Announcement } from '~/types'
  import dayjs from '~/util/dayjs'

  const showDialog = ref(false)
  const announcement = ref<Announcement>({} as Announcement)

  defineExpose({
    show(data: Announcement) {
      showDialog.value = true
      announcement.value = data
    },
  })
</script>
