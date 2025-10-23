import { defineStore } from 'pinia'
import AvatarPic from 'src/assets/AvatarProfilePic.png'

const mockFetchUser = async () => {
  await new Promise(r => setTimeout(r, 120))
  return {
    id: 'u-johanna',
    nickname: 'johannatilesova',
    first: 'Johanna',
    last: 'Tiles',
    email: 'johanna@example.com',
    status: 'away',
    avatarUrl: AvatarPic
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),
  getters: {
    fullName: (s) => s.user ? `${s.user.first} ${s.user.last}`.trim() : ''
  },
  actions: {
    async loadUser(force = false) {
      if (this.user && !force) return
      this.loading = true
      this.error = null
      try {
        this.user = await mockFetchUser()
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
  }
})