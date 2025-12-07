import { useAuthStore } from "src/store/authStore"
import { AppVisibility } from "quasar"
import { utils } from "src/utils/utils"

export const notificationService = { 
    handleNotification(message) {
        const authStore = useAuthStore()

        console.log('[!] Starting to handle notif')

        console.log(AppVisibility.appVisible)
        console.log(authStore.user.status)
        console.log(message.senderName)
        console.log(authStore.notificationPermissionGranted)

        if (
            AppVisibility.appVisible ||
            authStore.user.status === 'dnd' ||
            message.senderName === authStore.user.username
        ) return

        let notification = null

        if(authStore.user.mentionedNotify === true) {
            console.log('Here 1')

            const mentions = utils.extractMentions(message.messageText)

            if (!mentions.includes(authStore.user.username)) return
            
            notification = new Notification(`You were mentioned in #${message.channelName}`, {
                body: message.messageText.length > 33
                    ? message.messageText.substring(0, 30) + '...'
                    : message.messageText,
                icon: 'src/assets/icons/tea_icon.png',
            })
        } else  {
            notification = new Notification(`@${message.senderName} in #${message.channelName}`, {
              body:
                message.messageText.length > 33
                  ? message.messageText.substring(0, 30) + '...'
                  : message.messageText,
              icon: 'src/assets/icons/tea_icon.png',
            })
        }



        notification.onclick = () => {
            window.focus()
            notification.close()
        }
    }
}