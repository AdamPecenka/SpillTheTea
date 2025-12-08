import { defineStore } from 'pinia'
import { messageService } from 'src/services/messageService'

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: {}, // { channelId: [{message}, {message}, ...], ... }
    pageSize: 20,
    offlineMessages: {},
    moreMessagesAvailable: {}, // { channelId: boolean, ... }
  }),

  getters: {},

  actions: {
    async getMessages(channelId) {
      if (!this.messages[channelId]) {
        this.messages[channelId] = []
      }

      const oldest = messageService.getOldestMessage(this.messages[channelId])
      const oldestTimestamp = oldest ? oldest.sentTimestamp : null

      const messages = await messageService.getMessagesForChannel(channelId, this.pageSize, oldestTimestamp)

      this.messages[channelId] = [...this.messages[channelId], ...messages].sort(
        (a, b) => new Date(a.sentTimestamp).getTime() - new Date(b.sentTimestamp).getTime(),
      )

      this.moreMessagesAvailable[channelId] = messages.length === this.pageSize
    },

    appendMessage(message) {
      if(!this.messages[message.channelId]) {
        this.messages[message.channelId] = []
      }

      console.log('[i] New message received in channel', message.channelId, ':', message)
      console.log('[i] Current messages in channel:', this.messages[message.channelId])

      this.messages[message.channelId].push({
        id: message.id,
        senderName: message.senderName,
        messageText: message.messageText,
        sentTimestamp: message.sentTimestamp,
        channelName: message.channelName,
      })
    }
  },

  persist: {
    storage: sessionStorage,
  },
})
