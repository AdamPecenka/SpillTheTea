import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { wsService } from 'src/services/wsServiceFE'
import { messageService } from 'src/services/messageService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    notificationPermissionGranted: null,
  }),

  getters: {
    isAuthenticated(state) {
      return !!state.token
    },
    fullname(state) {
      return state.user ? `${state.user.first} ${state.user.last}`.trim() : ''
    },
    grantedPermissions(state) {
      return state.notificationPermissionGranted === 'granted' ? true : false
    },
  },

  actions: {
    async init() {
      if (this.token) {
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`
        wsService.init(this.user.id, this.token)
      }
      if ('Notification' in window) {
        this.notificationPermission = await Notification.requestPermission()
      }
    },
    async login(username, password) {
      try {
        const response = await api.post('/auth/login', { username, password })

        this.token = response.data.token
        this.user = response.data.user
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`

        wsService.init(this.user.id, this.token)

        return true
      } catch (e) {
        console.error(`[!!!]\n${e}`)
        this.logout()
        return false
      }
    },
    async register(data) {
      try {
        const response = await api.post('/auth/register', data)

        this.token = response.data.token
        this.user = response.data.user
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`

        return {
          ok: true,
          errMsg: null,
        }
      } catch (e) {
        console.log(`[!!!]\n${e}`)

        const msg = e.response?.data?.message || 'Registration failed.'

        console.log('Store: ' + msg)
        return {
          ok: false,
          errMsg: msg,
        }
      }
    },
    logout() {
      this.token = null
      this.user = null
      delete api.defaults.headers.common.Authorization

      wsService.destroy()
    },
    async fetchUser() {
      if (!this.token) return

      const response = await api.get('/auth/me')
      this.user = response.data
    },
    setStatus(status) {
      if (!this.user) return

      const previousStatus = this.user.status
      
      if(previousStatus === status) return
  
      this.user.status = status

      let newestTimestamps = null

      if(previousStatus === 'offline' && status !== 'offline'){
        newestTimestamps = messageService.getNewestTimestampsByChannel()
      }

      wsService.updateStatus(status, newestTimestamps)      
    },
    updateStatus(status) {
      if(!this.user || !status) return
      this.user.status = status
    },
    setNotificationPermission(perm) {
      if (!this.user) return
      this.notificationPermission = perm

      console.log(this.notificationPermission)
    },
    setMentionSettings(value) {
      if(!this.user) return

      this.user.mentionedNotify = value
      
      wsService.updateMentionSettings(value)
    },
    updateMentionSettings(value) {
      if(!this.user) return
      this.user.mentionedNotify = value
    }
  },

  persist: {
    key: 'auth',
    storage: localStorage,
    paths: ['token', 'user', 'notificationPermissionGranted'],
  },
})
