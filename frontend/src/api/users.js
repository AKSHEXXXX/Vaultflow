import api from './axios'

export const usersApi = {
  me: () => api.get('/users/me'),
  list: () => api.get('/users'),
  invite: (data) => api.post('/users/invite', data),
  updateRole: (id, data) => api.put(`/users/${id}/role`, data),
  delete: (id) => api.delete(`/users/${id}`),
}
