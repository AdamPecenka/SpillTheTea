<template>
  <q-dialog v-model="dialogOpen" 
  :position="isMobile ? 'standard' : 'right'">
    <q-card class="settings-card">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Settings</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Settings Content -->
      <q-card-section class="q-pt-md">
        <div class="settings-list">
          <!-- Notifications - zobrazuje stav podľa DND -->
          <div class="setting-item">
            <div class="setting-label">
              <div class="setting-title">Notifications</div>
              <div class="setting-description">
                {{ notificationsDescription }}
              </div>
            </div>
            <q-toggle
              :model-value="notificationsEnabled"
              color="positive"
              size="lg"
              disable
              readonly
            />
          </div>

          <q-separator class="q-my-md" />

          <!-- Only @mentions Toggle - nastaviteľné vždy -->
          <div class="setting-item">
            <div class="setting-label">
              <div class="setting-title">Only @mentions</div>
              <div class="setting-description">
                Get notified only when someone mentions you
              </div>
            </div>
            <q-toggle
              v-model="mentionedNotify"
              color="positive"
              size="lg"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Footer info -->
      <q-card-section class="q-pt-md">
        <div class="text-caption text-grey-7">
          <div v-if="isDndStatus" class="row items-center q-gutter-xs">
            <q-icon name="bedtime" size="16px" color="grey-7" />
            <span>Notifications are disabled because your status is "Do Not Disturb"</span>
          </div>
          <span v-else>
            Changes are saved automatically
          </span>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { useAuthStore } from 'src/store/authStore';

export default {
  name: 'SettingsPanel',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    userStatus: {
      type: String,
      default: 'online',
      validator: (value) => ['online', 'away', 'dnd', 'offline'].includes(value)
    }
  },
  
  emits: ['update:modelValue', 'update:settings'],
  
  data() {
    return {
      authStore: useAuthStore(),
    }
  },
  
  computed: {
    dialogOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },

    mentionedNotify: {
      get() {
        return this.authStore.user.mentionedNotify
      },
      set(value) {
        this.authStore.setMentionSettings(value)

        this.$q.notify({
          message: 'Settings saved',
          color: 'positive',
          position: 'top',
          timeout: 1000,
          icon: 'check_circle'
        })
      }
    },
    
    // Notifikácie sú enabled ak NENÍ DND status
    notificationsEnabled() {
      return this.userStatus !== 'dnd'
    },
    
    isDndStatus() {
      return this.userStatus === 'dnd'
    },
    
    notificationsDescription() {
      if (this.isDndStatus) {
        return 'Automatically disabled when status is "Do Not Disturb"'
      }
      return 'Receive notifications for new messages'
    },

    isMobile(){
      return this.$q.screen.width < 600
    },
  },
  
  watch: {
    settings: {
      handler(newSettings) {
        this.localSettings = { ...newSettings }
      },
      deep: true,
      immediate: true
    }
  },
  
  methods: {
  }
}
</script>

<style scoped>
.settings-card {
  width: 400px;
  max-width: 90vw;
  border-radius: 16px;
}

.settings-list {
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.setting-label {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-title {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.setting-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* Mobile responsive */
@media (max-width: 599px) {
  .settings-card {
    width: calc(100vw - 32px); /* Margins on sides */
    max-width: 400px;
    max-height: 60vh; /* Limit height to 60% of viewport */
    border-radius: 16px; /* Rounded corners */
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>