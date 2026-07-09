import api from "./api"

export const authService = {
  login: async (email, password) => {
    return await api.post('/login', { email, password })
  },

  getMe: async () => {
    return await api.get('/users/me')
  },

  changePassword: async (currentPassword, newPassword) => {
    return await api.post('/users/change-password', { currentPassword, newPassword })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}
