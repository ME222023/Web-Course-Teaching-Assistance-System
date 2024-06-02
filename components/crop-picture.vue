<template>
  <client-only>
    <el-dialog v-model="dialogVisible" width="500px" align-center>
      <template #header>
        <div class="font-size-5 text-gray-800 px-4 mt-2">裁切图片</div>
      </template>
      <div class="flex justify-center items-center">
        <cropper
          class="w-150 h-100"
          :src="sourceImage"
          :debounce="300"
          :stencil-props="{
            aspectRatio: props.aspectRatio,
          }"
          image-restriction="stencil"
          @change="onResize"
        />
      </div>
      <template #footer>
        <el-button type="primary" size="default" class="m-auto" @click="finish">确定</el-button>
      </template>
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
  import { Cropper, type CropperResult } from 'vue-advanced-cropper'
  import 'vue-advanced-cropper/dist/style.css'

  const props = defineProps<{
    aspectRatio: number
  }>()

  defineExpose({
    show(imageUrl: string) {
      sourceImage.value = imageUrl
      dialogVisible.value = true
    },
  })

  const dialogVisible = ref(false)
  const sourceImage = ref('')
  const previewImg = ref('')

  const emit = defineEmits<{
    (e: 'update', newCover: string): void
  }>()

  function onResize(event: CropperResult) {
    const img = event.canvas?.toDataURL('image/jpeg', 0.6)
    if (!img) return
    previewImg.value = img
  }

  function finish() {
    if (!previewImg.value) return ElMessage.error('请选择图片')
    emit('update', previewImg.value)
    dialogVisible.value = false
  }
</script>
