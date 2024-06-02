/**
 * 统一的异常处理函数。支持只传入 Error 对象，也支持传入操作名称和 Error 内容。
 * @example
 * ```ts
 * try {
 *  throw new Error('test')
 * } catch (error: any) {
 *   handleError('获取用户信息', error) // 弹出消息：获取用户信息失败：test
 *   // 或者
 *   handleError(error) // 弹出消息：test
 * }
 * ```
 */
export function handleError(err: any): void
export function handleError(operation: string, err: any): void
export function handleError(operationOrError: any, err?: any) {
  if (err === undefined) {
    console.error(operationOrError)
    ElMessage.error(operationOrError.message || operationOrError)
    return
  }
  console.error(err)
  ElMessage.error(`${operationOrError}失败：${err.message}`)
}
