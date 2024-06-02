// sm.ms 图床的 API

import { SMMS_TOEKN } from "~/constants";

const baseUrl = 'https://sm.ms/api/v2/';

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
      'Authorization': SMMS_TOEKN
    },
    body: formData
  });

  const result = await response.json();
  return result as UploadImageResponse;
}

export const SMMS = {
  uploadImage,
};
