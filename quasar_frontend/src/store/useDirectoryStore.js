// src/store/useDirectoryStore.js
import { defineStore } from 'pinia'
import * as api from 'src/services/api.service'
import wsService from 'src/services/websocket.service'

export const useDirectoryStore = defineStore('directory', {
  state: () => ({
    channels: [],
    activeChat: null,
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
      if (!state.activeChat) return null
      
      const channel = state.channels.find(c => c.id === state.activeChat)
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
        console.log('📡 Loading channels...')
        
        const channels = await api.getChannels()
        this.channels = channels
        
        console.log('✅ Loaded', channels.length, 'channels')

        if (!wsService.connected) {
          wsService.init('http://localhost:3333')
          
          wsService.connectToChannels({
            onChannelCreated: (channel) => {
              console.log('🆕 New channel:', channel.name)
              if (!this.channels.find(c => c.id === channel.id)) {
                this.channels.push(channel)
              }
            },
            
            onChannelUpdated: (channel) => {
              console.log('✏️ Updated:', channel.name)
              const index = this.channels.findIndex(c => c.id === channel.id)
              if (index !== -1) {
                this.channels[index] = channel
              }
            },
            
            onChannelDeleted: ({ channelId }) => {
              console.log('🗑️ Deleted channel:', channelId)
              this.channels = this.channels.filter(c => c.id !== channelId)
              
              if (this.activeChat === channelId) {
                this.activeChat = null
              }
            },
            
            onConnected: () => {
              console.log('✅ WebSocket connected')
            },
            
            onError: (error) => {
              console.error('❌ WebSocket error:', error)
            }
          })
        }
        
      } catch (error) {
        console.error('Failed to load channels:', error)
      }
    },

    async createChannel(data) {
      try {
        console.log('➕ Creating:', data.name)
        const channel = await api.createChannel(data)
        console.log('✅ Created:', channel.name)
        return channel
      } catch (error) {
        console.error('Create failed:', error)
        throw error
      }
    },

    async updateChannel(channelId, data) {
      try {
        console.log('✏️ Updating:', channelId)
        const channel = await api.updateChannel(channelId, data)
        console.log('✅ Updated:', channel.name)
        return channel
      } catch (error) {
        console.error('Update failed:', error)
        throw error
      }
    },

    async deleteChannel(channelId) {
      try {
        console.log('🗑️ Deleting:', channelId)
        await api.deleteChannel(channelId)
        console.log('✅ Deleted')
      } catch (error) {
        console.error('Delete failed:', error)
        throw error
      }
    },

    /**
     * 🆕 Toggle pin channelu
     */
    async togglePin(channelId) {
      try {
        const channel = this.channels.find(c => c.id === channelId)
        if (!channel) {
          console.error('Channel not found:', channelId)
          return
        }
        
        const newPinState = !channel.isPinned
        
        console.log('📌 Toggling pin:', channelId, '→', newPinState)
        
        // Lokálne update (optimistic)
        channel.isPinned = newPinState
        
        // Update cez API
        await this.updateChannel(channelId, {
          isPinned: newPinState
        })
        
        console.log('✅ Pin toggled')
        
      } catch (error) {
        console.error('Failed to toggle pin:', error)
        // Vráť späť na pôvodný stav
        const channel = this.channels.find(c => c.id === channelId)
        if (channel) {
          channel.isPinned = !channel.isPinned
        }
        throw error
      }
    },

    setActiveChat(channelId) {
      this.activeChat = channelId
    },

    clearActiveChat() {
      this.activeChat = null
    },

    disconnectWebSocket() {
      wsService.disconnect()
    },

    loadFriends() {
      // Dummy
    }
  }
})