import { defineStore } from 'pinia'
import AvatarPic from 'src/assets/AvatarProfilePic.png'

const mockFetchUser = () => {
  return {
    id: 'u-abracadabra',
    username: 'abracadabra',
    first: 'Abraca',
    last: 'Dabra',
    email: 'abraca@dabra.com',
    password: 'Heslo@123',
    status: 'online',
    avatarUrl: AvatarPic
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    isLogged: false
  }),
  getters: {
    fullName: (s) => s.user ? `${s.user.first} ${s.user.last}`.trim() : ''
  },
  actions: {
    loadUser(force = false) {
      if (this.user && !force) return
      this.loading = true
      this.error = null
      try {
        this.user = mockFetchUser()
      } catch (e) {
        this.error = e?.message || String(e)
      } finally {
        this.loading = false
      }
    },
    setStatus(status) {
      if (!this.user) return
      this.user.status = status
    },
    updateUser(patch) {
      if (!this.user) return
      this.user = { ...this.user, ...patch }
    }
  },
  persist: {
    storage: sessionStorage
  }
})