import { defineStore } from 'pinia'
import { messageService } from 'src/services/messageService'

export const useMessageStore = defineStore('message', {
  state: () => ({
    pageSize: 20,
    messages: {},               // { channelId: [{message}, {message}, ...], ... }
    moreMessagesAvailable: {},  // { channelId: boolean, ... }
    typingIndicators: {},       // { userId: message, ... }
    typingTimers: {}            // { username: timeoutId, ... }
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
        senderAvatarUrl: message.senderAvatarUrl,
        messageText: message.messageText,
        sentTimestamp: message.sentTimestamp,
        channelName: message.channelName,
      })
    },

    clearMessagesForChannel(channelId) {
      if(this.messages[channelId] !== undefined) {
        delete this.messages[channelId]
      }
      if(this.moreMessagesAvailable[channelId] !== undefined) {
        delete this.moreMessagesAvailable[channelId]
      }
    },

    addTypingUser(username, message){
      this.typingIndicators[username] = message

      clearTimeout(this.typingTimers[username])

      this.typingTimers[username] = setTimeout(() => {
        if (this.typingIndicators[username] !== undefined) {
          delete this.typingIndicators[username]
        }
        delete this.typingTimers[username]
      }, 3000)
    },

    removeTypingUser(username) {
      if (this.typingTimers[username]) {
        clearTimeout(this.typingTimers[username])
        delete this.typingTimers[username]
      }
      if (this.typingIndicators[username]) {
        delete this.typingIndicators[username]
      }
    },

    resetTypingIndicators() {
      for (const username in this.typingTimers) {
        clearTimeout(this.typingTimers[username])
      }

      this.typingTimers = {}
      this.typingIndicators = {}
    }
  },

  persist: {
    storage: sessionStorage,
  },
})
