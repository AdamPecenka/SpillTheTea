import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { useAuthStore } from 'src/store/useAuthStore'

const api = axios.create({
    baseURL: 'http://localhost:3333',
    withCredentials: true,
    headers: {},
})

export default boot(({ app }) => {
    const auth = useAuthStore()

    api.interceptors.request.use((config) => {
        if (auth.token) {
            config.headers.Authorization = `Bearer ${auth.token}`
        }
        return config
    })

    app.config.globalProperties.$axios = axios
    app.config.globalProperties.$api = api
    })

export { api }
