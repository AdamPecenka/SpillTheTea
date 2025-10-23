import { defineStore } from 'pinia'

// fake API – neskôr vymeníš za reálne volania
async function delay(ms=150){ return new Promise(r=>setTimeout(r,ms)) }
async function fetchChannels() {
  await delay()
  return [
    { id:'general', name:'general', topic:'team-wide', members:12 },
    { id:'random',  name:'random',  topic:'off-topic', members:7  },
    { id:'uni',  name:'uni',  topic:'off-topic', members:250  },
  ]
}
async function fetchFriends() {
  await delay()
  return [
    { id:'u-juraj',  name:'Juraj',  status:'online' },
    { id:'u-eliska', name:'Eliška', status:'away'   },
    { id:'u-michal', name:'Michal', status:'offline'},
    { id:'u-juraj',  name:'Juraj',  status:'online' },
    { id:'u-adam', name:'Adam', status:'offline'   },
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
    channelBy: (s) => (idOrName) =>
      s.channels.find(c => c.id === idOrName || c.name === idOrName),
    friendBy: (s) => (idOrName) =>
      s.friends.find(u => u.id === idOrName || u.name === idOrName),
    channelsSorted: (s) => [...s.channels].sort((a,b)=>a.name.localeCompare(b.name)),
    friendsSorted:  (s) => [...s.friends].sort((a,b)=>a.name.localeCompare(b.name)),
  },
  actions: {
    async loadChannels(force=false){
      if (this.channelsLoaded && !force) return
      this.channels = await fetchChannels()
      this.channelsLoaded = true
    },
    async loadFriends(force=false){
      if (this.friendsLoaded && !force) return
      this.friends = await fetchFriends()
      this.friendsLoaded = true
    },
  }
})