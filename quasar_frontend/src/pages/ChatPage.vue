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

                <!-- Leave channel / Close DM -->
                <q-item clickable v-ripple @click="leaveChat" class="text-negative">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section>
                    {{ activeChatData.type === 'channel' ? 'Leave channel' : 'Close conversation' }}
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
        <q-chat-message
          v-for="msg in messages"
          :key="msg.id"
          :name="msg.senderName"
          :text="[msg.messageText]"
          :sent="msg.senderName === authStore.user.username ? true : false"
          :bg-color="msg.senderName === authStore.user.username ? 'pink-11' : 'purple-4'"
          text-color="white"
          :stamp="new Date(msg.sentTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })"
          :class="{ 'ping-highlight': msg.messageText.includes(`@${authStore.user.username}`) && msg.senderName !== authStore.user.username }"      
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
import { useChannelStore } from 'src/store/channelStore'
import { useMessageStore } from 'src/store/messageStore';
import { useAuthStore } from 'src/store/authStore';
import { Notify, Dialog } from 'quasar'

export default {
  name: 'ChatPage',

  emits: ['view-members'],

  data() {
    return {
      typingUsers: ['user1', 'user2'],
      activeTypingUser: null,
      typingText: {
        user1: 'Hello, I am typing this...',
        user2: 'And I am typing something else'
      },
      channelStore: null,
      authStore: null,
      messageStore: null,
    }
  },

  watch: {
    'channelStore.activeChannelId'() {
      this.messagePageNum = 1
    },
  },

  computed: {
    activeChatData() {
      return this.channelStore?.activeChatData || null
    },

    messages(){
      return this.messageStore?.messages[this.channelStore.activeChannelId] || []
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

  created() {
    this.channelStore = useChannelStore()
    this.authStore = useAuthStore()
    this.messageStore = useMessageStore()

    this.channelStore.loadChannels()


    // dynamicky watcher tu, lebo ked som ho definoval v sekcii "watch", tak to nefungovalo ¯\_(ツ)_/¯
    this.$watch(
      () => {
        const channelId = this.channelStore.activeChannelId
        return this.messageStore.messages[channelId]?.length
      },
      () => {
        this.scrollToBottom()
      }
    )
  },
  mounted() {
    this.scrollToBottom()
  },
  
  methods: {
    async onLoad(index, done) {
      if(this.messageStore.moreMessagesAvailable[this.channelStore.activeChannelId]) {
        await this.messageStore.getMessages(this.channelStore.activeChannelId)
      }
      done()
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

    viewMembers() {
      // Emitujeme event nahor do layoutu, aby sa otvoril pravý panel
      this.$emit('view-members')
    },

    leaveChat() {
      if (!this.activeChatData) return
      
      const isChannel = this.activeChatData.type === 'channel'
      const chatName = this.activeChatData.title
      
      Dialog.create({
        title: isChannel ? 'Leave Channel' : 'Close Conversation',
        message: isChannel 
          ? `Are you sure you want to leave ${chatName}?`
          : `Are you sure you want to close this conversation with ${chatName}?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        // Clear active chat
        // !!!! potom treba zmenit za odstranenie channela zo store, nie len zmazanie aktivneho id
        this.channelStore.clearActiveChat()
        
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

/* Ak NEMÁ subtitle, centruj vertikálne */
.chat-header-content:not(.has-subtitle) .chat-header-left {
  justify-content: center;
}

/* Ak má subtitle, nechaj štandardne */
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
  background: rgba(255, 255, 255, 0.9);
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
</style>