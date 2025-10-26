<template>
  <q-page class="flex column">
    <div 
      class="q-pa-md overflow-auto col"
      :style="{ maxHeight: `calc(100vh - ${typingUsers.length ? 160 : 130}px)` }"
    >
      <q-infinite-scroll reverse @load="onLoad">
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
export default {
  name: 'ChatPage',

  data() {
    return {
      idCounter: 1,
      messages: [],
      typingUsers: ['user1', 'user2'],
      activeTypingUser: null,
      typingText: {
        user1: 'Hello, I am typing this...',
        user2: 'And I am typing something else'
      }
    }
  },

  created() {
    for (let i = 0; i < 20; i++) {
      const isPing = Math.random() < 0.2

      this.addMessage(
        i % 2 === 0 ? 'abracadabra' : 'simsalabim',
        i % 2 === 0 ? 'Smrdis' : 
          isPing ? '@abracadabra ty smrdis' : 'Nieeee :(',
        i % 2 === 0
      )
    }
  },
  mounted() {
    this.scrollToBottom()  
  },
  
  methods: {
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
        this.messages.unshift(...older)
        done()
      }, 1000)
    },

    onUserClick(username) {
      this.activeTypingUser = this.activeTypingUser === username ? null : username
    },

    scrollToBottom() {
      const container = this.$refs.chatContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }
}
</script>

<style scoped>
.ping-highlight {
  background-color: rgba(219, 136, 194, 0.15);
  border-radius: 10px;
}

.typing-indicator {
  padding: 6px 16px;
  font-size: 0.95rem;
  color: #444;
  position: relative;
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