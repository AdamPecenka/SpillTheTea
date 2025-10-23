<template>
  <q-item clickable v-ripple @click="$emit('click', channel)">
    <q-item-section avatar>
      <q-avatar size="32px" :color="avatarColor" text-color="white">
        <q-icon :name="channelIcon" size="18px" />
      </q-avatar>
    </q-item-section>
    
    <q-item-section>
      <q-item-label class="text-weight-medium">
        <q-icon 
          v-if="pinned" 
          name="push_pin" 
          size="14px" 
          class="q-mr-xs text-grey-7"
        />
        {{ channel.name }}
      </q-item-label>
      <q-item-label caption v-if="channel.topic">
        {{ channel.topic }}
      </q-item-label>
    </q-item-section>

    <!-- Badge pre private channel -->
    <q-item-section side v-if="channel.isPrivate">
      <q-icon name="lock" size="16px" color="grey-6" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Channel {
  id: string
  name: string
  topic?: string
  isPrivate?: boolean
  isPinned?: boolean
}

interface Props {
  channel: Channel
  pinned?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'click', channel: Channel): void
}>()

// Ikona podľa typu kanála
const channelIcon = computed(() => {
  if (props.channel.isPrivate) {
    return 'tag' // alebo 'lock' pre private
  }
  return 'tag' // hashtag pre public
})

// Farba avatara
const avatarColor = computed(() => {
  if (props.pinned) {
    return 'primary'
  }
  return props.channel.isPrivate ? 'grey-7' : 'grey-5'
})
</script>

<style scoped>
.q-item {
  min-height: 48px;
}
</style>