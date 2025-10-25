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

    
    <q-item-section side class="row items-center q-gutter-xs">
      <div class="row items-center q-gutter-xs justify-end">
        <q-icon v-if="channel.isPrivate" name="lock" size="16px" color="grey-6" />
        
        <q-btn
          dense
          flat
          round
          icon="more_vert"
          @click.stop
        >
          <q-menu auto-close transition-show="jump-down" transition-hide="jump-up">
            <q-list style="min-width: 120px">
              <q-item clickable v-ripple @click="togglePin">
                <q-item-section avatar>
                  <q-icon name="push_pin" />
                </q-item-section>
                <q-item-section>
                  {{ pinned ? 'Unpin' : 'Pin' }}
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-ripple class="text-negative" @click="deleteChannel">
                <q-item-section avatar>
                  <q-icon name="delete" color="negative" />
                </q-item-section>
                <q-item-section>
                  Delete
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>  
    </q-item-section>
  </q-item>
</template>

<script>
import { useDirectoryStore } from 'src/store/useDirectoryStore';

export default {
  name: 'ChannelListItem',
  data () {
    return {
      channelStore: useDirectoryStore()
    }
  },
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
      return this.channel.isPrivate ? 'tag' : 'tag';
    },
    avatarColor() {
      return this.pinned ? 'primary' : (this.channel.isPrivate ? 'grey-7' : 'grey-5');
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.channel);
    },
    togglePin () {
      this.channelStore.togglePin(this.channel.id)
    },
    deleteChannel () {
      this.channelStore.deleteChannel(this.channel.id)
    }
  }
}
</script>

<style scoped>
.q-item {
  min-height: 48px;
}
</style>