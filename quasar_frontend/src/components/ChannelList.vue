<template>
  <q-scroll-area class="fit">
    <!-- Pinned Channels -->
    <div v-if="pinnedChannels.length > 0">
      <div class="q-px-md q-pt-sm q-pb-xs">
        <div class="text-caption text-weight-bold text-grey-7">PINNED</div>
      </div>
      <q-list padding>
        <ChannelListItem
          v-for="ch in pinnedChannels"
          :key="ch.id"
          :channel="ch"
          :pinned="true"
          @click="goToChat"
        />
      </q-list>
      <q-separator class="q-mx-md q-my-xs" />
    </div>

    <!-- Invitations -->
    <div v-if="inviteChannels.length > 0">
      <div class="q-px-md q-pt-sm q-pb-xs">
        <div class="text-caption text-weight-bold text-grey-7">INVITED</div>
      </div>
      <q-list padding>
        <ChannelListItem
          v-for="ch in inviteChannels"
          :key="ch.id"
          :channel="ch"
          @click="preventOpeningInvitedChat"
        />
      </q-list>
      <q-separator class="q-mx-md q-my-xs" />
    </div>

    <!-- Private Channels -->
    <div v-if="privateChannels.length > 0">
      <div class="q-px-md q-pt-sm q-pb-xs">
        <div class="text-caption text-weight-bold text-grey-7">PRIVATE CHANNELS</div>
      </div>
      <q-list padding>
        <ChannelListItem
          v-for="ch in privateChannels"
          :key="ch.id"
          :channel="ch"
          @click="goToChat"
        />
      </q-list>
      <q-separator class="q-mx-md q-my-xs" />
    </div>

    <!-- Public Channels -->
    <div v-if="publicChannels.length > 0">
      <div class="q-px-md q-pt-sm q-pb-xs">
        <div class="text-caption text-weight-bold text-grey-7">PUBLIC CHANNELS</div>
      </div>
      <q-list padding>
        <ChannelListItem
          v-for="ch in publicChannels"
          :key="ch.id"
          :channel="ch"
          @click="goToChat"
        />
      </q-list>
    </div>
  </q-scroll-area>
</template>

<script>
import ChannelListItem from 'components/ChannelListItem.vue'
import { useChannelStore } from 'src/store/channelStore'
import { Notify } from 'quasar'

export default {
  name: 'ChannelList',
  
  components: {
    ChannelListItem
  },
  
  emits: ['channel-selected'],
  
  setup() {
    const channelStore = useChannelStore()
    
    return {
      channelStore
    }
  },
  
  computed: {
    allChannels() {
      return this.channelStore.channels || []
    },
    
    pinnedChannels() {
      return this.allChannels.filter(ch => ch.isPinned)
    },
    
    privateChannels() {
      return this.allChannels.filter(ch => !ch.isPinned && ch.isPrivate && !ch.isInvite)
    },
    
    publicChannels() {
      return this.allChannels.filter(ch => !ch.isPinned && !ch.isPrivate && !ch.isInvite)
    },
    
    inviteChannels() {
      return this.allChannels.filter(ch => !ch.isPinned && ch.isInvite)
    }
  },
  
  methods: {
    async goToChat(channel) {

      await this.channelStore.setActiveChat(channel.id)
      this.$router.push({ name: 'chat' })
      this.$emit('channel-selected') // Emit event pre mobile drawer close
      
    },
    preventOpeningInvitedChat() {
      this.channelStore.clearActiveChat()

      Notify.create({
          message: 'You can\'t preview this channel, since you are not part of it',
          type: 'negative',
          position: 'top'
        })
      this.$router.push({ name: 'index' })
    },
  }
}
</script>