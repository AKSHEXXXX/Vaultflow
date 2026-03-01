import api from './axios'

export const tenantsApi = {
  me:     ()       => api.get('/tenants/me'),
  update: (data)   => api.put('/tenants/me', data),
}
