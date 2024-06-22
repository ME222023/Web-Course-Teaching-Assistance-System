import type { UploadFiles } from 'element-plus'

interface SelectImageOptions {
  /** 限制图片大小，单位 MB */
  maxSize?: number
}
/** 让用户选择一张图片，并返回图片的 Base64 字符串。 */
export async function selectImage(options?: SelectImageOptions) {
  return new Promise<string>((resolve, reject) => {
    const { onChange, open } = useFileDialog({
      accept: 'image/*',
      multiple: false,
    })
    onChange((fileList) => {
      const file = fileList![0]

      if (options?.maxSize && file.size > options.maxSize * 1024 * 1024) {
        reject(new Error(`图片大小超过限制，最大 ${options.maxSize} MB`))
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = (error) => {
        reject(error)
      }
      reader.readAsDataURL(file)
    })
    open()
  })
}

export async function convertFileToBase64(uploadFiles: UploadFiles): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const files = Array.from(uploadFiles)
    const promises = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve(reader.result as string)
          }
          reader.onerror = (error) => {
            reject(error)
          }
          reader.readAsDataURL(file.raw!)
        }),
    )
    Promise.all(promises).then(resolve).catch(reject)
  })
}

export function createObjectURL(file: Blob): string {
  return URL.createObjectURL(file)
}
