import api from './axios'

export const documentsApi = {
  list: () => api.get('/documents'),
  get: (id) => api.get(`/documents/${id}`),
  upload: (formData, onProgress) =>
    api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  delete: (id) => api.delete(`/documents/${id}`),
  submit: (id) => api.post(`/documents/${id}/submit`),
  approve: (id) => api.post(`/documents/${id}/approve`),
  reject: (id) => api.post(`/documents/${id}/reject`),
}
