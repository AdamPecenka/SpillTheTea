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
    async getMessages(channelId, pageNum) {
      if (!this.messages[channelId]) {
        this.messages[channelId] = []
      }

      const messages = await messageService.getMessagesForChannel(channelId, pageNum, this.pageSize)

      // aby sme nepridavali duplicitne spravy pri meneni aktivenho kanalu
      // kedze vtedy sa vzdy zavola tato funkcia s pageNum = 1
      if (pageNum !== 1 || this.messages[channelId].length === 0) {
        this.messages[channelId] = [...this.messages[channelId], ...messages].sort(
          (a, b) => new Date(a.sentTimestamp).getTime() - new Date(b.sentTimestamp).getTime(),
        )
      }

      if (messages.length === this.pageSize) {
        this.moreMessagesAvailable[channelId] = true
      } else {
        this.moreMessagesAvailable[channelId] = false
      }
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
