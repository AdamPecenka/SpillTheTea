import { defineStore } from 'pinia'

function fetchChannels() {
  return [
    {
      id: 'general',
      name: 'general',
      topic: 'team-wide',
      members: 12,
      isPrivate: false,
      isPinned: true,
      isInvite: false,
    },
    {
      id: 'random',
      name: 'random',
      topic: 'off-topic',
      members: 7,
      isPrivate: true,
      isPinned: false,
      isInvite: false,
    },
    {
      id: 'uni',
      name: 'uni',
      topic: 'off-topic',
      members: 250,
      isPrivate: false,
      isPinned: false,
      isInvite: false,
    },
    {
      id: 'vpwa',
      name: 'VPWA',
      topic: 'web-dev',
      members: 100,
      isPrivate: true,
      isPinned: true,
      isInvite: false,
    },
    {
      id: 'cooked',
      name: 'cooked',
      topic: '',
      members: 45,
      isPrivate: true,
      isPinned: false,
      isInvite: false,
    },
    {
      id: 'cars',
      name: 'cars',
      topic: 'car-meets',
      members: 300,
      isPrivate: false,
      isPinned: false,
      isInvite: false,
    },
    {
      id: 'nsfw',
      name: 'NSFW(18+)',
      topic: 'Single moms in ur area <3',
      members: 69,
      isPrivate: true,
      isPinned: false,
      isInvite: true,
    },
  ]
}

function fetchFriends() {
  return [
    { id: 'u-damian', name: 'Damian', status: 'online' },
    { id: 'u-monika', name: 'Monika', status: 'away' },
    { id: 'u-adam', name: 'Adam', status: 'offline' },
    { id: 'u-jano', name: 'Jano', status: 'dnd' },
    { id: 'u-katka', name: 'Katka', status: 'offline' },
    { id: 'u-terka', name: 'Terka', status: 'away' },
    { id: 'u-ema', name: 'Ema', status: 'away' },
    { id: 'u-tyty', name: 'Tyty', status: 'dnd' },
    { id: 'u-marek', name: 'Marek', status: 'online' },
  ]
}

export const useDirectoryStore = defineStore('directory', {
  state: () => ({
    channels: [],
    channelsLoaded: false,
    friends: [],
    friendsLoaded: false,
    // Active chat tracking
    activeChat: null, // { type: 'channel' | 'dm', id: 'channel-id' | 'user-id' }
  }),
  getters: {
    channelBy: (state) => (idOrName) =>
      state.channels.find((c) => c.id === idOrName || c.name === idOrName),
    friendBy: (state) => (idOrName) =>
      state.friends.find((u) => u.id === idOrName || u.name === idOrName),
    channelsSorted: (state) => [...state.channels].sort((a, b) => a.name.localeCompare(b.name)),
    friendsSorted: (state) => [...state.friends].sort((a, b) => a.name.localeCompare(b.name)),
    // Getters pre aktívny chat
    activeChatData: (state) => {
      if (!state.activeChat) return null
      
      if (state.activeChat.type === 'channel') {
        const channel = state.channels.find(c => c.id === state.activeChat.id)
        if (channel) {
          return {
            type: 'channel',
            title: `#${channel.name}`,
            subtitle: channel.topic || null,
            data: channel
          }
        }
      }
      
      if (state.activeChat.type === 'dm') {
        const user = state.friends.find(u => u.id === state.activeChat.id)
        if (user) {
          const statusMap = {
            'online': 'Online',
            'away': 'Away',
            'dnd': 'Do not disturb',
            'offline': 'Offline'
          }
          return {
            type: 'dm',
            title: `@${user.name}`,
            subtitle: statusMap[user.status] || user.status,
            data: user
          }
        }
      }
      
      return null
    }
  },
  actions: {
    loadChannels(force = false) {
      if (this.channelsLoaded && !force) return
      this.channels = fetchChannels()
      this.channelsLoaded = true
    },
    loadFriends(force = false) {
      if (this.friendsLoaded && !force) return
      this.friends = fetchFriends()
      this.friendsLoaded = true
    },
    addChannel(c) {
      if (c) {
        this.channels.push(c)
      }
    },
    deleteChannel(id) {
      this.channels = this.channels.filter((c) => c.id !== id)
      // Clear active chat if deleting active channel
      if (this.activeChat?.type === 'channel' && this.activeChat?.id === id) {
        this.activeChat = null
      }
    },
    togglePin(id) {
      const ch = this.channels.find((c) => c.id === id)
      if (ch) {
        ch.isPinned = !ch.isPinned
      }
    },
    // Set active chat
    setActiveChannel(channelId) {
      this.activeChat = { type: 'channel', id: channelId }
    },
    setActiveDM(userId) {
      this.activeChat = { type: 'dm', id: userId }
    },
    clearActiveChat() {
      this.activeChat = null
    }
  },
  persist: {
    storage: sessionStorage,
  },
})