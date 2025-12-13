import { api } from 'boot/axios'
import { useChannelStore } from 'src/store/channelStore'
import { useAuthStore } from 'src/store/authStore'
import { useMessageStore } from 'src/store/messageStore'
import { wsService } from 'src/services/wsServiceFE'
import { notificationService } from 'src/services/notificationService'
import { Notify } from 'quasar'


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

    if (!channelId) {
      console.error('[!] No active channel to send message to.')
      return
    }

    const message = {
      channelId: channelId,
      senderId: authStore.user.id,
      senderAvatarUrl: authStore.user.avatarUrl,
      messageText: messageContent,
    }

    wsService.sendMessage(message)
  },

  hahahihi(messageContent) {
    const channelStore = useChannelStore()
    const authStore = useAuthStore()

    const channelId = channelStore.activeChannelId

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
      senderId: authStore.user.id,
      senderAvatarUrl: authStore.user.avatarUrl,
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
  },

  handleInviteCommand(text) {
    const activeChannelId = useChannelStore().activeChannelId
    const channel = useChannelStore().channels.find(c => c.id === activeChannelId)
    const parts = text.split(' ')
    const username = parts[1]

    if(!activeChannelId) return

    if (parts.length < 2) {
      this.sendMessage(text)
      return
    }

    if(channel.isPrivate === true && channel.isAdmin === false) {
      Notify.create({
        message: 'Only admin can invite into private channel!',
        type: 'negative',
      })
      return
    }
    
    wsService.sendInvite(activeChannelId, username)
  },

  handleRevokeCommand(text){
    const activeChannelId = useChannelStore().activeChannelId
    const channel = useChannelStore().channels.find(c => c.id === activeChannelId)

    if(!activeChannelId) return

    const parts = text.split(' ')
    const username = parts[1]

    if(username === useAuthStore().user.username) {
      Notify.create({
        message: 'Cant remove yourself',
        type: 'warn'
      })

      return
    }

    if (parts.length < 2) {
      this.sendMessage(text)
      return
    }

    if(channel.isAdmin === false){
      Notify.create({
        message: 'This command is only for ADMINS',
        type: 'negative'
      })

      return
    }

    useChannelStore()
    wsService.revokeMember(activeChannelId, username)
  },

  handleKickCommand(text){
    // todo
  }
}
