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
                  <q-item-section> Join </q-item-section>
                </q-item>
                
                <q-separator />

                <q-item clickable v-ripple @click="rejectInvite" class="text-negative">
                  <q-item-section avatar>
                    <q-icon name="cancel" color="negative" />
                  </q-item-section>
                  <q-item-section> Reject </q-item-section>
                </q-item>
              </template>

              <!-- Default Menu -->
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

                <q-item clickable v-ripple class="text-negative" @click="openLeaveChannelDialog">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section> Leave </q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </div>  
    </q-item-section>

    <!-- Leave Confirmation Dialog -->
    <q-dialog v-model="leaveDialog">
      <q-card class="leave-card" style="min-width: 300px">
        <q-card-section class="text-h4">
          Leave channel
        </q-card-section>

        <q-card-section class="text-body1">
          <p>Leaving channel as an <b>Admin</b> will cause the channel to be deleted!</p>
          
          <p>Are you sure you want to leave 
            <span style="display: inline-block; padding: 2px 8px; background: #f0f0f0; border-radius: 6px; font-weight: 600; color: #000;">
              {{channel.name}}
            </span>?</p>
        </q-card-section>

        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn 
            flat 
            label="Cancel" 
            color="grey-7" 
            class="rounded-btn"
            v-close-popup 
          />

          <q-btn 
            unelevated
            label="Leave" 
            color="primary"
            class="rounded-btn"
            @click="confirmLeaveChannel" 
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-item>
</template>

<script>
import { useChannelStore } from 'src/store/channelStore';

export default {
  name: 'ChannelListItem',
  data () {
    return {
      channelStore: useChannelStore(),
      leaveDialog: false
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
    togglePin() {
      this.channelStore.togglePin(this.channel.id)
    },
    openLeaveChannelDialog() {
      this.leaveDialog = true
    },
    confirmLeaveChannel() {
      this.leaveDialog = false
      this.channelStore.leaveChannel(this.channel.id)
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
.rounded-btn {
  border-radius: 12px !important;
  padding: 8px 18px !important;
  font-size: 15px;
}
.leave-card {
  border-radius: 16px !important;
}
</style>