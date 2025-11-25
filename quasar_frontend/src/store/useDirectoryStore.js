// src/store/useDirectoryStore.js
import { defineStore } from 'pinia'
import * as api from 'src/services/api.service'
import wsService from 'src/services/websocket.service'
import { useAuthStore } from 'src/store/useAuthStore'


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

        // ✅ Initialize WebSocket if not connected
        if (!wsService.connected) {
          console.log('🔌 Initializing WebSocket...')
          await wsService.init('http://localhost:3333')
          
          // ✅ SPRÁVNE CALLBACK NÁZVY pre Transmit v2
          wsService.connectToChannels({
            onChannelCreated: (channel) => {
              console.log('🆕 New channel received:', channel.name)
              
              // Skontroluj či channel už neexistuje (avoid duplicates)
              const exists = this.channels.find(c => c.id === channel.id)
              if (!exists) {
                this.channels.push(channel)
                console.log('✅ Channel added to list')
              } else {
                console.log('⚠️ Channel already exists, skipping')
              }
            },
            
            onChannelUpdated: (channel) => {
              console.log('✏️ Channel updated received:', channel.name)
              
              const index = this.channels.findIndex(c => c.id === channel.id)
              if (index !== -1) {
                // ⚠️ Preserve user-specific data if backend doesn't send it
                if (channel.isPinned === undefined && this.channels[index].isPinned !== undefined) {
                  channel.isPinned = this.channels[index].isPinned
                }
                
                this.channels[index] = channel
                console.log('✅ Channel updated in list')
              } else {
                console.log('⚠️ Channel not found in list')
              }
            },
            
            onChannelDeleted: ({ channelId }) => {
              console.log('🗑️ Channel deleted received:', channelId)
              
              const oldLength = this.channels.length
              this.channels = this.channels.filter(c => c.id !== channelId)
              
              if (this.channels.length < oldLength) {
                console.log('✅ Channel removed from list')
              } else {
                console.log('⚠️ Channel was not in list')
              }
              
              // Clear active chat if it was deleted
              if (this.activeChat === channelId) {
                this.activeChat = null
              }
            },
            
            onConnected: () => {
              console.log('✅ WebSocket connected to channels')
            },
            
            onError: (error) => {
              console.error('❌ WebSocket error:', error)
            }
          })
        } else {
          console.log('✅ WebSocket already connected')
        }
        
      } catch (error) {
        console.error('❌ Failed to load channels:', error)
        throw error
      }
    },

    async createChannel(data) {
      try {
        console.log('➕ Creating channel:', data.name)
        const channel = await api.createChannel(data)
        console.log('✅ Channel created on server:', channel.name)
        
        // Note: Channel will be added to list via WebSocket broadcast
        // No need to manually add it here
        
        return channel
      } catch (error) {
        console.error('❌ Create channel failed:', error)
        throw error
      }
    },

    async updateChannel(channelId, data) {
      try {
        console.log('✏️ Updating channel:', channelId)
        const channel = await api.updateChannel(channelId, data)
        console.log('✅ Channel updated on server:', channel.name)
        
        // Note: Channel will be updated in list via WebSocket broadcast
        
        return channel
      } catch (error) {
        console.error('❌ Update channel failed:', error)
        throw error
      }
    },

    async deleteChannel(channelId) {
      try {
        console.log('🗑️ Deleting channel:', channelId)
        await api.deleteChannel(channelId)
        console.log('✅ Channel deleted on server')
        
        // Note: Channel will be removed from list via WebSocket broadcast
        
      } catch (error) {
        console.error('❌ Delete channel failed:', error)
        throw error
      }
    },

    /**
     * 🆕 Toggle pin channelu - OPRAVENÁ VERZIA
     * ✅ Volá správny endpoint: updateChannelMember (nie updateChannel!)
     */
    async togglePin(channelId) {
      try {
        const channel = this.channels.find(c => c.id === channelId)
        if (!channel) {
          console.error('❌ Channel not found:', channelId)
          return
        }
        
        const newPinState = !channel.isPinned
        
        console.log('📌 Toggling pin:', channelId, '→', newPinState)
        
        // Optimistic update (update UI immediately)
        const oldPinState = channel.isPinned
        channel.isPinned = newPinState
        
        try {
          // ⚠️ DOČASNE: Hardcoded userId = 1
          const userId = 1
          
          // 🆕 Volaj správny endpoint - update channel_member!
          await api.updateChannelMember(channelId, userId, {
            isPinned: newPinState
          })
          
          console.log('✅ Pin toggled on server')
          
          // Note: All windows will be updated via WebSocket broadcast
          
        } catch (error) {
          // Rollback on error
          console.error('❌ Failed to toggle pin, rolling back:', error)
          channel.isPinned = oldPinState
          throw error
        }
        
      } catch (error) {
        console.error('❌ Toggle pin failed:', error)
        throw error
      }
    },

    // ✅ OPRAVENÝ NÁZOV - konzistentný s ostatnými
    setActiveChat(channelId) {
      console.log('💬 Setting active chat:', channelId)
      this.activeChat = channelId
    },

    clearActiveChat() {
      console.log('💬 Clearing active chat')
      this.activeChat = null
    },

    disconnectWebSocket() {
      console.log('👋 Disconnecting WebSocket...')
      wsService.disconnect()
    },

    loadFriends() {
      // Placeholder pre budúcnosť
      console.log('👥 Loading friends (not implemented)')
    }
  }
})