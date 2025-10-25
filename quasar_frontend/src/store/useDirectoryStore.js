import { defineStore } from 'pinia'

function fetchChannels() {
  return [
    { id:'general', name:'general', topic:'team-wide', members:12, isPrivate: false, isPinned: true  },
    { id:'random',  name:'random',  topic:'off-topic', members:7, isPrivate: true, isPinned: false  },
    { id:'uni',  name:'uni',  topic:'off-topic', members:250, isPrivate: false, isPinned: false  },
    { id:'vpwa',  name:'VPWA',  topic:'web-dev', members:100, isPrivate: true, isPinned: true  },
    { id:'cooked',  name:'cooked',  topic:'', members:45, isPrivate: true, isPinned: false  },
    { id:'cars',  name:'cars',  topic:'car-meets', members:300, isPrivate: false, isPinned: false  },
  ]
}

function fetchFriends() {
  return [
    { id:'u-damian',  name:'Damian',  status:'online' },
    { id:'u-monika', name:'Monika', status:'away'   },
    { id:'u-adam', name:'Adam', status:'offline'},
    { id:'u-jano', name:'Jano', status:'dnd'   },
    { id:'u-katka', name:'Katka', status:'offline'   },
    { id:'u-terka', name:'Terka', status:'away'   },
    { id:'u-ema', name:'Ema', status:'away'   },
    { id:'u-tyty', name:'Tyty', status:'dnd'   },
    { id:'u-marek', name:'Marek', status:'online'}
  ]
}

export const useDirectoryStore = defineStore('directory', {
  state: () => ({
    channels: [],
    channelsLoaded: false,
    friends: [],
    friendsLoaded: false,
  }),
  getters: {
    channelBy: (state) => (idOrName) =>
      state.channels.find((c) => c.id === idOrName || c.name === idOrName),
    friendBy: (state) => (idOrName) =>
      state.friends.find((u) => u.id === idOrName || u.name === idOrName),
    channelsSorted: (state) => [...state.channels].sort((a, b) => a.name.localeCompare(b.name)),
    friendsSorted: (state) => [...state.friends].sort((a, b) => a.name.localeCompare(b.name)),
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
    },
    togglePin(id) {
      const ch = this.channels.find((c) => c.id === id)
      if (ch) {
        ch.isPinned = !ch.isPinned
      }
    }
  },
  persist: {
    storage: sessionStorage,
  }
})