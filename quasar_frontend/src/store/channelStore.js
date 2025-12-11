import { defineStore } from 'pinia'
import { channelService } from 'src/services/channelService'
import { wsService } from 'src/services/wsServiceFE'
import { useMessageStore } from './messageStore'

export const useChannelStore = defineStore('channel', {
  state: () => ({
    channels: [],
    inviteChannels: [],
    activeChannelId: null,
    activeChannelMembers: [],
  }),

  getters: {
    channelsSorted(state) {
      return [...state.channels].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        if (a.isPrivate && !b.isPrivate) return -1
        if (!a.isPrivate && b.isPrivate) return 1
        return a.name.localeCompare(b.name)
      })
    },

    activeChatData(state) {
      if (!state.activeChannelId) return null

      const channel = state.channels.find((c) => c.id === state.activeChannelId)
      if (channel) {
        return {
          id: channel.id,
          title: channel.name,
          subtitle: channel.description,
          isPrivate: channel.isPrivate,
          isPinned: channel.isPinned,
          isAdmin: channel.isAdmin,
        }
      }

      return null
    },
  },

  actions: {
    async loadChannels() {
      try {
        this.channels = await channelService.getChannels()
      } catch (e) {
        console.error('[!] Failed to load channels:', e)
        throw e
      }
    },

    async createChannel(data) {
      try {
        wsService.createChannel(data)
      } catch (e) {
        console.error('[!] Create channel failed:', e)
        throw e
      }
    },

    async togglePin(channelId) {
      try {
        const channel = this.channels.find((c) => c.id === channelId)

        if (!channel) {
          console.error('[!] Channel not found:', channelId)
          return
        }

        channel.isPinned = !channel.isPinned

        wsService.pinChannel(channelId, channel.isPinned)
      } catch (e) {
        console.error('[!] Toggle pin failed:', e)
        throw e
      }
    },

    updatePinnedState(channelId, pinState) {
      const channel = this.channels.find((c) => c.id === channelId)
      if (channel) {
        channel.isPinned = pinState
      }
    },

    async setActiveChat(channelId) {
      if (this.activeChannelId === channelId) return

      this.activeChannelId = channelId
      this.activeChannelMembers = await channelService.getChannelMembers(channelId)

      const messageStore = useMessageStore()

      useMessageStore().resetTypingIndicators()


      if (
        messageStore.moreMessagesAvailable[channelId] === undefined ||
        messageStore.moreMessagesAvailable[channelId]
      ) {
        await messageStore.getMessages(channelId, 1)
      }
    },

    clearActiveChat() {
      useMessageStore().resetTypingIndicators()
      this.activeChannelId = null
      this.activeChannelMembers = []
    },

    addNewChannel(channel) {
      console.log(channel)
      this.channels.push(channel)
    },

    leaveChannel(channelId) {
      const isAdmin = this.channels.find((c) => c.id === channelId)?.isAdmin

      this.removeChannel(channelId)

      isAdmin ? wsService.deleteChannel(channelId) : wsService.leaveChannel(channelId)
    },

    removeChannel(channelId) {
      const messageStore = useMessageStore()

      this.clearActiveChat()
      this.channels = this.channels.filter((c) => c.id !== channelId)
      this.inviteChannels = this.inviteChannels.filter((c) => c.id !== channelId)

      messageStore.clearMessagesForChannel(channelId)
    },

    removeMemberFromActiveChannel(userId) {
      if (!this.activeChannelMembers) return
      this.activeChannelMembers = this.activeChannelMembers.filter((member) => member.id !== userId)
    },

    updateMemberList(channelId, member) {
      console.log('new member incoming')

      console.log('active channel:', this.activeChannelId)
      console.log('member channel:', channelId)
      console.log(this.activeChannelId === channelId)

      if (this.activeChannelId !== channelId) return

      console.log(member)

      this.activeChannelMembers.push(member)

      console.log(this.activeChannelMembers)
    }
  },

  persist: {
    storage: sessionStorage,
  },
})
