import api from './api'

import api from './api'

export async function uploadProfileImage(file) {
  if (!file) {
    throw new Error('No file provided for upload')
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/users/upload-profile-pic', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export default {
  uploadProfileImage,
}


