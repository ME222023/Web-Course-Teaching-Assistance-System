<template>
  <ul ref="list" id="list" class="image-list">
    <li v-for="(file, index) in imageFileList" :key="file.uid" draggable="true">
      <img :src="file.url" :alt="file.name" />
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import type { UploadFile } from 'element-plus'

  // 从父组件传递 imageFileList 数据
  const props = defineProps<{ imageFileList: UploadFile[] }>()

  const dragged = ref<HTMLElement | null>(null)
  const list = ref<HTMLElement | null>(null)

  const handleDragStart = (event: DragEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('li')) return
    dragged.value = target.closest('li')
    dragged.value!.style.border = '3px dashed #3498db'
    const img = dragged.value!.querySelector('img')
    if (img) {
      img.style.opacity = '0.4'
    }
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault() // 阻止默认行为，允许元素放置
  }

  const getIndex = (el: HTMLElement | null) => {
    let index = 0
    while ((el = el?.previousElementSibling as HTMLElement | null)) {
      index++
    }
    return index
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    const target = event.target as HTMLElement
    const dropped = target.closest('li')
    if (!dropped || dropped === dragged.value) {
      return
    }
    const draggedIndex = getIndex(dragged.value)
    const droppedIndex = getIndex(dropped)
    if (draggedIndex > droppedIndex) {
      list.value?.insertBefore(dragged.value!, dropped)
    } else {
      list.value?.insertBefore(dragged.value!, dropped.nextSibling)
    }
  }

  const handleDragEnd = (event: DragEvent) => {
    if (dragged.value) {
      dragged.value.style.border = '1px solid #ddd'
      const img = dragged.value.querySelector('img')
      if (img) {
        img.style.opacity = ''
      }
    }
  }

  onMounted(() => {
    if (list.value) {
      list.value.addEventListener('dragstart', handleDragStart)
      list.value.addEventListener('dragover', handleDragOver)
      list.value.addEventListener('drop', handleDrop)
      list.value.addEventListener('dragend', handleDragEnd)
    }
  })

  onBeforeUnmount(() => {
    if (list.value) {
      list.value.removeEventListener('dragstart', handleDragStart)
      list.value.removeEventListener('dragover', handleDragOver)
      list.value.removeEventListener('drop', handleDrop)
      list.value.removeEventListener('dragend', handleDragEnd)
    }
  })
</script>

<style scoped>
  .image-list {
    list-style-type: none;
    padding: 0;
  }

  .image-list li {
    display: inline-block;
    margin: 10px;
    cursor: move;
  }

  .image-list img {
    width: 100px;
    height: 100px;
    object-fit: cover;
  }
</style>
