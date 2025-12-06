import { defineStore } from 'pinia'
import * as api from 'src/services/api.service'
import { channelService } from 'src/services/channelService'
import { wsService } from 'src/services/wsServiceFE'


export const useChannelStore = defineStore('channel', {
  state: () => ({
    channels: [],
    inviteChannels: [],
    activeChannelId: null,
    activeChannelMembers: []
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
          type: 'channel',
          isPrivate: channel.isPrivate,
          isPinned: channel.isPinned
        }
      }

      return null
    }
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

    async deleteChannel(channelId) {
      // TODO
    },

    async togglePin(channelId) {
      try {

        const channel = this.channels.find(c => c.id === channelId)
        
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
      const channel = this.channels.find(c => c.id === channelId)
      if (channel) {
        channel.isPinned = pinState
      }
    },

    async setActiveChat(channelId) {
      if (this.activeChannelId === channelId) return

      this.activeChannelId = channelId
      this.activeChannelMembers = await channelService.getChannelMembers(channelId)

      console.log('[+] Active channel members:\n', this.activeChannelMembers)
    },

    clearActiveChat() {
      this.activeChannelId = null
      this.activeChannelMembers = []
    },

    addNewChannel(channel) {
      this.channels.push(channel)
    },
  },

  persist: {
    storage: sessionStorage,
  }
})