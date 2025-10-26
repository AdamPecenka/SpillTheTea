<template>
  <q-item clickable v-ripple @click="handleClick" :class="{ 'invite-highlight': channel.isInvite }">
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
              <!-- Invite Menu -->
              <template v-if="channel.isInvite">
                <q-item clickable v-ripple @click="acceptInvite">
                  <q-item-section avatar>
                    <q-icon name="login" color="grey-7" />
                  </q-item-section>
                  <q-item-section>Join</q-item-section>
                </q-item>
                
                <q-separator />

                <q-item clickable v-ripple @click="rejectInvite" class="text-negative">
                  <q-item-section avatar>
                    <q-icon name="cancel" color="negative" />
                  </q-item-section>
                  <q-item-section>Reject</q-item-section>
                </q-item>
              </template>

              <!-- Normal Channel Menu -->
              <template v-else>
                <q-item clickable v-ripple @click="togglePin">
                  <q-item-section avatar>
                    <q-icon name="push_pin" color="grey-7"/>
                  </q-item-section>
                  <q-item-section>
                    {{ pinned ? 'Unpin' : 'Pin' }}
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-ripple class="text-negative" @click="deleteChannel">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section>Leave</q-item-section>
                </q-item>
              </template>
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
      return this.pinned ? 'primary' : (this.channel.isPrivate || this.channel.isInvite ? 'grey-7' : 'grey-5');
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
.invite-highlight {
  background-color: rgba(219, 136, 194, 0.3);
  border-left: 5px solid #9c27b0; 
  transition: background-color 0.2s, border-color 0.2s;
}
.invite-highlight:hover {
  background-color: rgba(219, 136, 194, 0.4);
}
</style>