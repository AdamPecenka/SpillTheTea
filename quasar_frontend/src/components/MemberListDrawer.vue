<template>
  <div class="member-list-drawer">
    <!-- Header -->
    <div class="drawer-header q-pa-md">
      <div class="row items-center justify-between header-bar">
        
        <div class="text-h6 text-weight-medium">
          Members ({{ displayMembers.length }})
        </div>
        
        <!-- Close button (vpravo) -->
            <q-btn
              flat
              round
              dense
              icon="close"
              color="grey-7"
              @click="close"
            >
            <q-tooltip>Close</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Members List -->
    <div class="drawer-content-scroll">
      <q-list padding class="members-list">
        <UserListItem
          v-for="member in sortedMembers"
          :key="member.id"
          :user="member"
          @kick="onKick"
        />
      </q-list>

      <q-dialog v-model="confirmKickOpen">
        <q-card style="min-width: 400px; border-radius: 12px;" class="kick-dialog">
          <q-card-section class="q-pb-sm">
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">Kick Member</div>
              <q-btn
                flat
                round
                dense
                icon="close"
                color="grey-8"
                v-close-popup
              />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-md q-pb-md">
            <div v-if="memberToKick" class="text-body1">
              Do you really want to kick
              <span style="display: inline-block; padding: 2px 8px; background: #f0f0f0; border-radius: 6px; font-weight: 600; color: #000;">
                {{ memberToKick.name }}
              </span>
              from this channel?
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md q-pt-none">
            <q-btn
              flat
              label="CANCEL"
              no-caps
              class="cancel-btn"
              v-close-popup
            />
            <q-btn
              label="KICK"
              no-caps
              class="kick-action-btn"
              @click="confirmKick"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Empty state -->
      <div v-if="displayMembers.length === 0" class="q-pa-md text-center text-grey-7">
        <q-icon name="people_outline" size="48px" class="q-mb-sm" />
        <div>No members found</div>
      </div>
    </div>
  </div>
</template>

<script>
import UserListItem from './UserListItem.vue'
import { useChannelStore } from 'src/store/channelStore'

export default {
  name: 'MemberListDrawer',

  components: {
    UserListItem
  },
  
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  
  emits: ['update:modelValue', 'kick-member'],

  data(){
    return {
      confirmKickOpen:false,
      memberToKick: null,
      statusOrder: {
        'online': 1,
        'away': 2,
        'dnd': 3,
        'offline': 4
      },
      channelStore: useChannelStore()
    }
  },
  
  computed: {
    displayMembers() {
      return this.channelStore.activeChannelMembers || []
    },

    sortedMembers() {
      return [...this.displayMembers].sort((a, b) => {
        // Najprv porovnaj podľa statusu
        const statusA = this.statusOrder[a.status] || 999
        const statusB = this.statusOrder[b.status] || 999
        
        if (statusA !== statusB) {
          return statusA - statusB
        }
        
        // Ak majú rovnaký status, porovnaj podľa mena
        return a.fullname.localeCompare(b.name)
      })
    }
  },
  
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },

    onKick(user) {
      this.memberToKick = user
      this.confirmKickOpen = true
    },

    confirmKick() {
      if (this.memberToKick) {
        this.$emit('kick-member', this.memberToKick)
      }
      this.confirmKickOpen = false
      this.memberToKick = null
    }
  }
}
</script>

<style scoped>
.member-list-drawer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  background: white;
  flex-shrink: 0;
  height: 64px;          /* presne rovnaká výška ako top bar */
  min-height: 64px;
  display: flex;
  align-items: center;
}

.header-bar {
  width: 100%;
  padding-right: 12px;       /* rovnaké odsadenie ako na top bare */
  height: 64px;          /* match q-header */
  box-sizing: border-box;
}

.drawer-content-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: white;
  min-height: 0;
}

.members-list {
  background: white;
}

/* Ensure UserListItem is visible */
.members-list :deep(.q-item) {
  min-height: 56px;
}

/* Kick Dialog Styling */
.kick-dialog {
  border-radius: 12px;
}

.cancel-btn {
  color: #b0b0b0;
  font-weight: 500;
  font-size: 14px;
  border-radius: 12px;
  padding: 8px 20px;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  color: #808080;
}

.kick-action-btn {
  background: #d68ac3;
  color: white;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 24px;
  border-radius: 8px;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.kick-action-btn:hover {
  background: #c77ab3;
}
</style>