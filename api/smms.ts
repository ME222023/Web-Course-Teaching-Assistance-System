// sm.ms 图床的 API

const baseUrl = 'https://sm.ms/api/v2/';

const token = import.meta.env.SMMS_TOKEN;

export interface UploadImageResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    file_id: number;
    width: number;
    height: number;
    filename: string;
    storename: string;
    size: number;
    path: string;
    hash: string;
    url: string;
    delete: string;
    page: string;
  };
  RequestId: string;
}

async function uploadImage(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('smfile', file);

  const response = await fetch(`${baseUrl}upload`, {
    method: 'POST',
    headers: {
      'Authorization': token
    },
    body: formData
  });

  const result = await response.json();
  return result as UploadImageResponse;
}

export const SMMS = {
  uploadImage,
};
