import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/store/authStore'

export default boot(() => {
    const auth = useAuthStore()
    auth.init()
})
