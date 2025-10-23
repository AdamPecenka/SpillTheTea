<template>
  <q-item clickable v-ripple @click="handleClick">
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

    <!-- Badge for private channel -->
    <q-item-section side v-if="channel.isPrivate">
      <q-icon name="lock" size="16px" color="grey-6" />
    </q-item-section>
  </q-item>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ChannelListItem',
  props: {
    channel: {
      type: Object,
      required: true,
      validator: (value) => {
        return typeof value.id === 'string' && typeof value.name === 'string';
      }
    },
    pinned: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  computed: {
    channelIcon() {
      return this.channel.isPrivate ? 'tag' : 'tag'; // Adjust icon based on channel type
    },
    avatarColor() {
      return this.pinned ? 'primary' : (this.channel.isPrivate ? 'grey-7' : 'grey-5');
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.channel);
    }
  }
}
</script>

<style scoped>
.q-item {
  min-height: 48px;
}
</style>