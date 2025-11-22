import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        user: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        fullname: (state) => state.user ? `${state.user.first} ${state.user.last}`.trim() : ''
    },

    actions: {

        init() {
            if (this.token) {
                api.defaults.headers.common.Authorization = `Bearer ${this.token}`
            }
        },
        async login(username, password) {
            try{
                const response = await api.post('/auth/login', { username, password })

                this.token = response.data.token
                this.user = response.data.user
                api.defaults.headers.common.Authorization = `Bearer ${this.token}`
                
                return true
            } catch(e) {
                console.log(`[!!!]\n${e}`)
                this.logout()
                return false
            }
        },
        async register(data) {
            try{
                const response = await api.post('/auth/register', data)
     
                this.token = response.data.token
                this.user = response.data.user
                api.defaults.headers.common.Authorization = `Bearer ${this.token}`

                return true
            } catch(e) {
                console.log(`[!!!]\n${e}`)
                
                const msg = e.response?.data?.message || 'Registration failed.'
                
                console.log('Store: ' + msg)
                return { error: msg }
            }
        },
        logout() {
            this.token = null
            this.user = null
            delete api.defaults.headers.common.Authorization
        },
        async fetchUser() {
            if (!this.token) return

            const response = await api.get('/auth/me')
            this.user = response.data
        },
        setStatus(status) {
            if (!this.user) return
            this.user.status = status
        },
    },

    persist: {
        key: 'auth',
        storage: localStorage,
        paths: ['token', 'user', 'isLoggedIn'],
    },
})
