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

    <!-- Ivnitations -->
    <div v-if="inviteChannels.length > 0">
      <div class="q-px-md q-pt-sm q-pb-xs">
        <div class="text-caption text-weight-bold text-grey-7">INVITED</div>
      </div>
      <q-list padding>
        <ChannelListItem
          v-for="ch in inviteChannels"
          :key="ch.id"
          :channel="ch"
          @click="goToChat"
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
import { computed } from 'vue'
import ChannelListItem from 'components/ChannelListItem.vue'
import { useDirectoryStore } from 'src/store/useDirectoryStore'  // <-- PRIDAJ TOTO
import { Notify } from 'quasar';

export default {
  name: 'ChannelList',
  components: {
    ChannelListItem
  },
  props: {
    channels: {
      type: Array,
      required: true
    }
  },
  computed: {
    pinnedChannels() {
      return this.channels.filter(ch => ch.isPinned);
    },
    privateChannels() {
      return this.channels.filter(ch => !ch.isPinned && ch.isPrivate && !ch.isInvite);
    },
    publicChannels() {
      return this.channels.filter(ch => !ch.isPinned && !ch.isPrivate && !ch.isInvite);
    },
    inviteChannels() {
      return this.channels.filter(ch => !ch.isPinned && ch.isInvite);
    }
  },
  methods: {
    goToChat(channel) {
      const directoryStore = useDirectoryStore()

      console.log(channel)

      if(!channel.isInvite){
        directoryStore.setActiveChannel(channel.id)
        this.$router.push({ name: 'chat' })
      } else {
        Notify.create({
          message: 'You cant preview this channel, since u are not part of it',
          type: 'negative',
          position: 'top'
        })
        this.$router.push({ name: 'index' })
      }
    }
  }
}
</script>