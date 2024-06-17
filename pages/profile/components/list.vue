<template>
  <div class="flex flex-col ml-6 mt-2 min-w-120 w-2/3 max-w-160">
    <el-table :data="allexercises" style="width: 100%">
    <el-table-column prop="id" label="ID" width="50" />
    <el-table-column prop="title" label="Title" width="150" />
    <el-table-column prop="state" label="State" width="120" />
    <el-table-column prop="city" label="City" width="120" />
    <el-table-column prop="address" label="Address" width="600" />
    <el-table-column prop="zip" label="Zip" width="120" />
    <el-table-column fixed="right" label="Operations" width="120">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">
          Detail
        </el-button>
        <el-button link type="primary" size="small">Edit</el-button>
      </template>
    </el-table-column>
  </el-table>
  </div>
</template>

<script lang="ts" setup>
  import type { Exercise, Solution, SolutionStatus } from '~/types';
  import { listExercise, listSolution } from '~/util/db'

  export type Timestamp = number
  interface CombinedData {
    id: number
    title: string
    solutionCreatedAt: Timestamp
    status: SolutionStatus.Pending
  }

  const allexercises = ref<Exercise[]>([])
  const allsolution = ref<Solution[]>([])
  const combinedData = ref<CombinedData[]>([]);

  onMounted(async () => {
    allexercises.value = await listExercise()
    allsolution.value = await listSolution()
    combinedData.value = allexercises.value.map((exercise) => {
      const solution = allsolution.value.find((solution) => solution.exerciseId === exercise.id)
      return {
        id: exercise.id,
        title: exercise.title,
        solutionCreatedAt: solution?.createdAt || 0,
        status: solution?.status || SolutionStatus.Pending,
      }
    })
    
  
    console.log('Combined Data:', combinedData.value);
  })

  const handleClick = () => {
    console.log('click')
  }

  const tableData = [
    {
      date: '2016-05-03',
      name: 'Tom',
      state: 'California',
      city: 'Los Angeles',
      address: 'No. 189, Grove St, Los Angeles',
      zip: 'CA 90036',
      tag: 'Home',
    },
    {
      date: '2016-05-02',
      name: 'Tom',
      state: 'California',
      city: 'Los Angeles',
      address: 'No. 189, Grove St, Los Angeles',
      zip: 'CA 90036',
      tag: 'Office',
    },
    {
      date: '2016-05-04',
      name: 'Tom',
      state: 'California',
      city: 'Los Angeles',
      address: 'No. 189, Grove St, Los Angeles',
      zip: 'CA 90036',
      tag: 'Home',
    },
    {
      date: '2016-05-01',
      name: 'Tom',
      state: 'California',
      city: 'Los Angeles',
      address: 'No. 189, Grove St, Los Angeles',
      zip: 'CA 90036',
      tag: 'Office',
    },
  ]
</script>

<style></style>
