export function handleError(operation: string, err: any) {
  console.error(err)
  ElMessage.error(`${operation}失败：${err.message}`)
}
