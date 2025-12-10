import { useAuthStore } from "src/store/authStore"
import { AppVisibility } from "quasar"
import { utils } from "src/utils/utils"

export const notificationService = {
    handleNotification(message) {
        if (!message) return

        const authStore = useAuthStore()

        if (
            AppVisibility.appVisible
            || authStore.user.status === 'dnd'
            || message.senderName === authStore.user.username
        ) return

        let notification = null
        const mentions = utils.extractMentions(message.messageText)

        if (mentions.includes(authStore.user.username)) {
            notification = new Notification(`You were mentioned in #${message.channelName}`, {
                body: message.messageText.length > 33
                    ? message.messageText.substring(0, 30) + '...'
                    : message.messageText,
                icon: 'src/assets/icons/tea_icon.png',
            })
        }
        else if (authStore.user.mentionedNotify === false) {
            notification = new Notification(`@${message.senderName} in #${message.channelName}`, {
                body:
                    message.messageText.length > 33
                        ? message.messageText.substring(0, 30) + '...'
                        : message.messageText,
                icon: 'src/assets/icons/tea_icon.png',
            })
        }

        if (!notification) return

        notification.onclick = () => {
            window.focus()
            notification.close()
        }
    }
}