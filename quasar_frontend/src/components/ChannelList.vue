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
          @click="$emit('channel-click', ch)"
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
          @click="$emit('channel-click', ch)"
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
          @click="$emit('channel-click', ch)"
        />
      </q-list>
    </div>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChannelListItem from 'components/ChannelListItem.vue'

interface Channel {
  id: string
  name: string
  topic?: string
  isPrivate?: boolean
  isPinned?: boolean
}

interface Props {
  channels: Channel[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'channel-click', channel: Channel): void
}>()

// Rozdelenie kanálov podľa typu
const pinnedChannels = computed(() =>
  props.channels.filter(ch => ch.isPinned)
)

const privateChannels = computed(() =>
  props.channels.filter(ch => !ch.isPinned && ch.isPrivate)
)

const publicChannels = computed(() =>
  props.channels.filter(ch => !ch.isPinned && !ch.isPrivate)
)
</script>