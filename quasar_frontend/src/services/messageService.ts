import { api } from 'boot/axios'
import { useChannelStore } from 'src/store/channelStore'
import { useAuthStore } from 'src/store/authStore'
import { useMessageStore } from 'src/store/messageStore'
import { wsService } from 'src/services/wsServiceFE'
import { notificationService } from 'src/services/notificationService'


export const messageService = {
  async getMessagesForChannel(channelId, pageSize, oldestTimestamp) {
    const response = await api.get(`/api/channels/${channelId}/messages`, {
      params: {
        pageSize,
        oldestTimestamp,
      },
    })
    return response.data
  },

  sendMessage(messageContent) {
    const channelStore = useChannelStore()
    const authStore = useAuthStore()

    const channelId = channelStore.activeChannelId
    const userId = authStore.user.id

    if (!channelId) {
      console.error('[!] No active channel to send message to.')
      return
    }

    const message = {
      channelId: channelId,
      senderId: userId,
      messageText: messageContent,
    }

    wsService.sendMessage(message)
  },

  hahahihi(messageContent) {
    const channelStore = useChannelStore()
    const authStore = useAuthStore()

    const channelId = channelStore.activeChannelId
    const userId = authStore.user.id

    const shrug = '¯\\_(ツ)_/¯'
    const parts = messageContent.split(' ')

    const rest = parts.slice(1).join(' ').trim()

    if (!rest) {
      messageContent = shrug
    } else {
      messageContent = rest + ' ' + shrug
    }

    if (!channelId) {
      console.error('[!] No active channel to send message to.')
      return
    }

    const message = {
      channelId: channelId,
      senderId: userId,
      messageText: messageContent,
    }

    wsService.sendMessage(message)
  },

  handleIncomingMessage(message) {
    const messageStore = useMessageStore()

    notificationService.handleNotification(message)

    messageStore.removeTypingUser(message.senderName)
    messageStore.appendMessage(message)
  },

  getOldestMessage(messages) {
    if (!messages || messages.length === 0) return null

    const sorted = [...messages].sort((a, b) => {
      return new Date(a.sentTimestamp).getTime() - new Date(b.sentTimestamp).getTime();
    });

    return sorted[0];
  },

  handleJoinCommand(text) {
    const parts = text.split(' ')

    if (parts.length < 2) {
      this.sendMessage(text)
      return
    }

    const channelName = parts[1].trim()
    const isPrivate = parts[2] === 'private'

    wsService.joinChannel(channelName, isPrivate)
  },

  handleQuitCancelCommand(channelId) {
    if (useChannelStore().activeChannelId !== channelId || useChannelStore().activeChannelId === null) {
      return
    }
    
    useChannelStore().leaveChannel(channelId)
  },

  emitMessage(text) {
    const username = useAuthStore().user.username
    const channelId = useChannelStore().activeChannelId

    if(channelId === null) return

    wsService.typeMessage(channelId, username, text)
  }
}
