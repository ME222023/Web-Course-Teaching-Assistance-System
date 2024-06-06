<template>
  <div class="h-screen flex flex-col">
    <header>
      <el-menu mode="horizontal" :ellipsis="false">
        <el-menu-item @click="$router.push('/')">
          <h2> SZU Web OJ </h2>
        </el-menu-item>
      </el-menu>
    </header>
    <main class="flex-grow">
      <slot></slot>
    </main>
  </div>
</template>
