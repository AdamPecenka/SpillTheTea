<template>
  <q-page class="flex column">
    <!-- Chat Header -->
    <div v-if="activeChatData" class="chat-header">
      <div class="chat-header-content" :class="{ 'has-subtitle': activeChatData.subtitle }">
        <div class="chat-header-left">
          <div class="text-h6 text-weight-medium">{{ activeChatData.title }}</div>
          <div v-if="activeChatData.subtitle" class="text-caption text-grey-7">{{ activeChatData.subtitle }}</div>
        </div>
        <div class="chat-header-right">
          <q-btn flat round dense icon="more_vert">
            <q-menu auto-close>
              <q-list style="min-width: 180px">
                <!-- Mute/Unmute -->
                <q-item clickable v-ripple @click="toggleMute">
                  <q-item-section avatar>
                    <q-icon :name="isMuted ? 'notifications_off' : 'notifications_active'" :color="isMuted ? 'negative' : 'grey-7'" />
                  </q-item-section>
                  <q-item-section>
                    {{ isMuted ? 'Unmute' : 'Mute' }} notifications
                  </q-item-section>
                </q-item>

                <q-separator />

                <!-- View members (pre channels) -->
                <q-item 
                  v-if="activeChatData.type === 'channel'" 
                  clickable 
                  v-ripple 
                  @click="viewMembers"
                >
                  <q-item-section avatar>
                    <q-icon name="people" color="grey-7" />
                  </q-item-section>
                  <q-item-section>
                    View members
                  </q-item-section>
                </q-item>

                <q-separator v-if="activeChatData.type === 'channel'" />

                <!-- Leave channel -->
                <q-item clickable v-ripple @click="leaveChat" class="text-negative">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section>
                    Leave channel
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Chat Messages -->
    <div 
      ref="chatContainer"
      class="q-pa-md overflow-auto col chat-messages-container"
      :style="chatContainerStyle"
    >
      <q-infinite-scroll 
        reverse 
        @load="onLoad"
        :scroll-target="$refs.chatContainer"
      >
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner color="primary" name="dots" size="40px" />
          </div>
        </template>

        <q-chat-message
          v-for="msg in messages"
          :key="msg.id"
          :name="msg.name"
          :text="[msg.text]"
          :sent="msg.sent"
          :bg-color="msg.sent ? 'pink-11' : 'purple-4'"
          text-color="white"
          :stamp="new Date(msg.stamp).toLocaleTimeString()"
          :class="{ 'ping-highlight': msg.text.includes('@abracadabra') }"      
        />
      </q-infinite-scroll>
    </div>

    <!-- Typing indicator -->
    <div v-if="typingUsers.length" class="typing-indicator row items-center q-pa-sm relative">
      <span>
        <template v-for="user in typingUsers" :key="user">
          <a href="#" class="typing-user q-mr-xs" @click.prevent="onUserClick(user)">
            @{{ user }}
          </a>
        </template>
        <span>{{ typingUsers.length === 1 ? 'is' : 'are' }} typing</span>
        <q-spinner-dots color="primary" size="25px" class="q-ml-xs" />
      </span>

      <!-- Popup showing typing text for selected user -->
      <div v-if="activeTypingUser" class="typing-popup q-pa-sm shadow-2">
        <strong>@{{ activeTypingUser }}:</strong> {{ typingText[activeTypingUser] || 'Typing...' }}
      </div>
    </div>
  </q-page>
</template>

<script>
import { useDirectoryStore } from 'src/store/useDirectoryStore'
import { Notify, Dialog } from 'quasar'

export default {
  name: 'ChatPage',

  emits: ['view-members'],

  data() {
    return {
      idCounter: 1,
      messages: [],
      typingUsers: ['user1', 'user2'],
      activeTypingUser: null,
      typingText: {
        user1: 'Hello, I am typing this...',
        user2: 'And I am typing something else'
      },
      directoryStore: null,
      isMuted: false,
      // Mock members (same as in TypingBar.vue)
      members: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack']
    }
  },

  computed: {
    activeChatData() {
      return this.directoryStore?.activeChatData || null
    },
    
    chatContainerStyle() {
      // 64px header + 56px chat header + 70px typing bar + typing indicator
      const typingIndicatorHeight = this.typingUsers.length ? 40 : 0
      return {
        maxHeight: `calc(100vh - 64px - 56px - 70px - ${typingIndicatorHeight}px)`,
        paddingBottom: this.typingUsers.length ? '16px' : '8px'
      }
    }
  },
  
  watch: {
    'directoryStore.activeChat': {
      handler() {
        // Reload messages when active chat changes
        this.loadMessages()
        // Reset mute state for new chat
        this.isMuted = false
      },
      deep: true
    }
  },

  created() {
    this.directoryStore = useDirectoryStore()
    this.directoryStore.loadChannels()
    this.directoryStore.loadFriends()
    
    // Load initial messages
    this.loadMessages()
  },
  
  mounted() {
    this.scrollToBottom()
  },
  
  updated() {
    // Pri prvom načítaní správ, scrollneme dole
    if (this.messages.length === 20) {
      this.scrollToBottom()
    }
  },
  
  methods: {
    loadMessages() {
      // Clear existing messages
      this.messages = []
      this.idCounter = 1
      
      // Load demo messages
      for (let i = 0; i < 20; i++) {
        const isPing = Math.random() < 0.2

        this.addMessage(
          i % 2 === 0 ? 'abracadabra' : 'simsalabim',
          i % 2 === 0 ? 'Smrdis' : 
            isPing ? '@abracadabra ty smrdis' : 'Nieeee :(',
          i % 2 === 0
        )
      }
      
      // Dvojité $nextTick pre istotu
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      })
    },
    
    addMessage(name, text, sent) {
      this.messages.push({
        id: this.idCounter++,
        name,
        text,
        sent,
        stamp: Date.now()
      })
    },

    onLoad(index, done) {
      setTimeout(() => {
        const oldScrollHeight = this.$refs.chatContainer?.scrollHeight || 0
        
        const older = [
          {
            id: this.idCounter++,
            name: 'Adam',
            text: 'Earlier...',
            sent: true,
            stamp: Date.now() - 60000
          },
          {
            id: this.idCounter++,
            name: 'Johannka',
            text: 'Even earlier...',
            sent: false,
            stamp: Date.now() - 120000
          }
        ]
        
        // Pridáme staršie správy na začiatok
        this.messages.unshift(...older)
        
        // Udržíme scroll pozíciu po pridaní starších správ
        this.$nextTick(() => {
          const container = this.$refs.chatContainer
          if (container && oldScrollHeight) {
            const newScrollHeight = container.scrollHeight
            container.scrollTop = newScrollHeight - oldScrollHeight
          }
        })
        
        done()
      }, 1000)
    },

    onUserClick(username) {
      this.activeTypingUser = this.activeTypingUser === username ? null : username
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatContainer
        if (container) {
          // Scrollneme úplne dole
          container.scrollTop = container.scrollHeight
          
          // Backup scroll po 100ms
          setTimeout(() => {
            container.scrollTop = container.scrollHeight
          }, 100)
        }
      })
    },

    toggleMute() {
      this.isMuted = !this.isMuted
      
      const chatName = this.activeChatData?.title || 'Chat'
      
      Notify.create({
        message: this.isMuted 
          ? `Notifications muted for ${chatName}` 
          : `Notifications enabled for ${chatName}`,
        icon: this.isMuted ? 'notifications_off' : 'notifications_active',
        color: this.isMuted ? 'negative' : 'positive',
        position: 'top',
        timeout: 2000
      })
    },

    viewMembers() {
      // Emitujeme event nahor do layoutu, aby sa otvoril pravý panel
      this.$emit('view-members')
    },

    leaveChat() {
      if (!this.activeChatData) return
      
      const isChannel = this.activeChatData.type === 'channel'
      const chatName = this.activeChatData.title
      
      Dialog.create({
        title: 'Leave channel',
        message: `
          <div style="font-size: 15px; line-height: 1.5; color: #333;">
            Are you sure you want to leave 
            <span style="display: inline-block; padding: 2px 8px; background: #f0f0f0; border-radius: 6px; font-weight: 600; color: #000;">
              ${chatName}
            </span>?
          </div>
        `,

        class: 'leave-channel-dialog',
        
        cancel: {
          label: 'CANCEL',
          flat: true,
          color: 'grey-7',
        style: 'border-radius: 12px; padding: 8px 20px; text-transform: none;'
        },
        ok: {
          label: 'LEAVE',
          color: 'primary',
          unelevated: true,
          style: 'border-radius: 12px; padding: 8px 20px; text-transform: none;'
        },
        html: true,
        persistent: true,
        cardStyle: 'border-radius: 12px',
        cardClass: 'leave-channel-dialog'
      }).onOk(() => {
        // Clear active chat
        this.directoryStore.clearActiveChat()
        
        // Navigate back to index
        this.$router.push({ name: 'index' })
        
        Notify.create({
          message: isChannel ? 'Left channel' : 'Conversation closed',
          color: 'info',
          position: 'top',
          timeout: 2000
        })
      })
    }
  }
}
</script>

<style scoped>
/* Chat Header - Fixed height */
.chat-header {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.chat-header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.chat-header-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header-content:not(.has-subtitle) .chat-header-left {
  justify-content: center;
}

.chat-header-content.has-subtitle .chat-header-left {
  justify-content: center;
}

.chat-header-right {
  flex-shrink: 0;
}

.chat-messages-container {
  overflow-y: auto;
  overflow-x: hidden;
}

.ping-highlight {
  background-color: rgba(219, 136, 194, 0.15);
  border-radius: 10px;
}

.typing-indicator {
  padding: 6px 16px;
  font-size: 0.95rem;
  color: #444;
  position: relative;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.typing-user {
  font-weight: 600;
  color: #1976d2;
  cursor: pointer;
  text-decoration: none;
}

.typing-user:hover {
  text-decoration: underline;
}

.typing-popup {
  position: absolute;
  bottom: 36px;
  left: 16px;
  background-color: white;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.95rem;
  min-width: 180px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 2000;
}

/* Leave Channel Dialog Styling */
.leave-channel-dialog :deep(.q-card) {
  border-radius: 12px;  /* Popup má zaoblené rohy */
}
</style>