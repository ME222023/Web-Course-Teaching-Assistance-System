<template>
  <div class="flex flex-col">
    <el-row class="mx-10 mt-12">
      <el-col :span="15">
        <el-card header="最新题目" shadow="never">
          <template #header>
            <div class="flex items-center">
              <div>最新题目</div>
              <el-button
                class="ml-auto"
                :icon="ElIconRight"
                size="small"
                @click="onClickExercise()"
              >
                查看更多
              </el-button>
            </div>
          </template>
          <el-empty v-if="!exercises.length"></el-empty>
          <el-scrollbar v-else max-height="250px">
            <div
              v-for="(exercise, key) in exercises"
              class="rounded-2 hover:bg-gray-100 p-2 cursor-pointer transition-colors duration-200 ease-in-out"
              :key="key"
              shadow="never"
              @click="onClickExercise(exercise)"
            >
              <div class="flex items-center">
                <div class="line-clamp-1 mr-2">{{ exercise.title }}</div>
                <el-tooltip :content="dayjs(exercise.createdAt).format('L LT')" placement="top">
                  <div class="text-sm text-gray-500 ml-auto shrink-0">
                    {{ dayjs(exercise.createdAt).fromNow() }}
                  </div>
                </el-tooltip>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
      <el-col :span="8" :offset="1">
        <el-card header="站点公告" shadow="never">
          <el-empty v-if="!announcements.length"></el-empty>
          <el-scrollbar v-else max-height="250px">
            <div
              v-for="announcement in announcements"
              class="rounded-2 hover:bg-gray-100 p-2 cursor-pointer transition-colors duration-200 ease-in-out"
              :key="announcement.id"
              shadow="never"
              @click="announcementInfoDialogRef?.show(announcement)"
            >
              <div class="flex items-center">
                <div class="line-clamp-1 mr-2">{{ announcement.title }}</div>
                <el-tooltip :content="dayjs(announcement.createdAt).format('L LT')" placement="top">
                  <div class="text-sm text-gray-500 ml-auto shrink-0">
                    {{ dayjs(announcement.createdAt).fromNow() }}
                  </div>
                </el-tooltip>
              </div>
              <div class="text-sm text-gray-500 mt-1 line-clamp-3">{{ announcement.content }}</div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <el-footer class="flex items-center justify-center">
      <el-text>© 2024 SZU Web OJ</el-text>
    </el-footer>

    <announcement-info-dialog ref="announcementInfoDialogRef" />
  </div>
</template>

<script setup lang="ts">
  import type { Announcement, Exercise } from '~/types'
  import { listAnnouncement, listExercises } from '~/util/db'
  import { handleError } from '~/util/error_parser'
  import dayjs from '~/util/dayjs'
  import AnnouncementInfoDialog from '~/components/announcement-info-dialog.vue'

  const router = useRouter()

  const exercises = ref<Array<Pick<Exercise, 'id' | 'title' | 'createdAt'>>>([])
  const announcements = ref<Announcement[]>([])
  const announcementInfoDialogRef = ref<InstanceType<typeof AnnouncementInfoDialog>>()

  function onClickExercise(exercise?: { id: number }) {
    router.push({
      path: '/exercise',
      query: { id: exercise?.id },
    })
  }

  async function fetchExercises() {
    exercises.value = (await listExercises({ isPublished: true, descending: true })).map(
      (exercise) => ({
        id: exercise.id,
        title: exercise.title,
        createdAt: exercise.createdAt,
      }),
    )
  }

  async function fetchAnnouncements() {
    try {
      announcements.value = await listAnnouncement({})
    } catch (error) {
      handleError('获取公告列表', error)
    }
  }

  onMounted(() => {
    fetchExercises()
    fetchAnnouncements()
  })
</script>

<style></style>
