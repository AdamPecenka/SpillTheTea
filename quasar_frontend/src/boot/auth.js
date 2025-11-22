import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/auth'

export default boot(() => {
    const auth = useAuthStore()
    auth.init()
})
