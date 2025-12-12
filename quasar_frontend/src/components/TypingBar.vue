<template>
  <div class="typing-bar-container">
    <!-- Command Menu Popup -->
    <transition name="slide-up">
      <div 
        v-if="showCommandMenu && filteredCommands.length > 0" 
        class="command-menu"
      >
        <q-list dense>
          <q-item
            v-for="(cmd, index) in filteredCommands"
            :key="cmd.cmd"
            clickable
            v-ripple
            @click="selectCommand(cmd)"
            :class="{ 'command-item-active': index === selectedCommandIndex }"
            class="command-item"
          >
            <q-item-section avatar>
              <q-icon :name="cmd.icon" color="primary" size="20px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-body2">{{ cmd.cmd }}</q-item-label>
              <q-item-label caption class="text-grey-7" style="font-size: 0.7rem;">
                {{ cmd.desc }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <div class="text-caption text-grey-6 q-pa-xs q-pl-md" style="font-size: 0.65rem;">
          ⇥ Tab to select • ⎋ Esc to close
        </div>
      </div>
    </transition>

    <div class="typing-bar row items-center q-pa-sm q-gutter-sm">
      <q-input
        ref="inputRef"
        v-model="message"
        filled
        rounded
        dense
        :placeholder="placeholder"
        @keyup.enter="onSend"
        @update:model-value="onMessageChange"
        @keydown="onKeyDown"
        class="col"
      />
      <q-btn
        round
        dense
        icon="send"
        color="primary"
        @click="onSend"
      />
    </div>
  </div>
</template>

<script>
import { Notify } from 'quasar';
import { messageService } from 'src/services/messageService';
import { useChannelStore } from 'src/store/channelStore';

export default {
  name: 'TypingBar',
  
  data() {
    return {
      message: '',
      showCommandMenu: false,
      commandSearch: '',
      selectedCommandIndex: 0,
      commands: [
        { 
          cmd: '/join', 
          desc: 'Vytvorenie kanala / Vstup do verejneho kanala',
          icon: 'login',
          args: '<channel-name>',
        },
        { 
          cmd: '/invite', 
          desc: 'Pridanie pouzivatela do kanala',
          icon: 'person_add',
          args: '<username>'
        },
        { 
          cmd: '/revoke', 
          desc: 'Odobratie pouzivatela z kanala',
          icon: 'person_remove',
          args: '<username>'
        },
        { 
          cmd: '/kick', 
          desc: 'Vyhodenie clena kanala',
          icon: 'logout',
          args: '<username>'
        },
        { 
          cmd: '/quit', 
          desc: 'Zrusenie kanala spravcom',
          icon: 'delete_forever',
          args: ''
        },
        { 
          cmd: '/cancel', 
          desc: 'Opustenie kanala',
          icon: 'exit_to_app',
          args: ''
        },
        { 
          cmd: '/list', 
          desc: 'Zobrazenie zoznamu clenov kanala',
          icon: 'people',
          args: ''
        }
      ],
      channelStore: useChannelStore(),
    }
  },
  
  props: {
    placeholder: { type: String, default: 'Type a message...' }
  },

  emits: ['view-members'],
  
  computed: {
    filteredCommands() {
      // keď je len samotné "/" → zobraz všetky príkazy
      if (!this.commandSearch && this.message === '/') {
        return this.commands
      }

      // keď je za "/" nič → nič neukazuj
      if (!this.commandSearch) {
        return []
      }

      const search = this.commandSearch.toLowerCase()
      const full = '/' + search

      // prefix match, napr. "/j", "/jo", "/join"
      return this.commands.filter(cmd =>
        cmd.cmd.toLowerCase().startsWith(full)
      )
    }
  },
  
  methods: {
    onMessageChange(value) {
      messageService.emitMessage(value)

      // Check if message starts with /
      if (value && value.startsWith('/')) {
        this.showCommandMenu = true
        
        // Extract search term (everything after / until space)
        const parts = value.slice(1).split(' ')
        this.commandSearch = parts[0]
        this.selectedCommandIndex = 0
        
      } else {
        this.showCommandMenu = false
        this.commandSearch = ''
      }
    },
    
    onKeyDown(event) {
      if (!this.showCommandMenu || this.filteredCommands.length === 0) return
      
      // Arrow Down
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        this.selectedCommandIndex = Math.min(
          this.selectedCommandIndex + 1, 
          this.filteredCommands.length - 1
        )
      }
      
      // Arrow Up
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        this.selectedCommandIndex = Math.max(this.selectedCommandIndex - 1, 0)
      }
      
      // Tab to select
      if (event.key === 'Tab' && this.filteredCommands.length > 0) {
        event.preventDefault()
        const selected = this.filteredCommands[this.selectedCommandIndex]
        this.selectCommand(selected)
      }
      
      // Escape to close
      if (event.key === 'Escape') {
        event.preventDefault()
        this.showCommandMenu = false
      }
    },
    
    selectCommand(cmd) {
      // Replace message with selected command
      if (cmd.args) {
        this.message = `${cmd.cmd} ${cmd.args}`
        // Select the args part after a short delay
        this.$nextTick(() => {
          const input = this.$refs.inputRef?.$el?.querySelector('input')
          if (input) {
            const argsStart = cmd.cmd.length + 1
            setTimeout(() => {
              input.setSelectionRange(argsStart, this.message.length)
              input.focus()
            }, 50)
          }
        })
      } else {
        this.message = `${cmd.cmd} `
        this.$nextTick(() => {
          const input = this.$refs.inputRef?.$el?.querySelector('input')
          if (input) {
            setTimeout(() => {
              input.focus()
            }, 50)
          }
        })
      }
      
      this.showCommandMenu = false
      this.commandSearch = ''
      this.selectedCommandIndex = 0
    },
    
    async onSend() {
      const text = this.message.trim()
      if (!text) return

      const cmd = text.split(' ')[0]

      this.message = ''
      this.showCommandMenu = false

      switch(cmd){
        case "/join":
          messageService.handleJoinCommand(text)
          break
          
        case "/invite":
          
          break
          
        case "/revoke":
          
          break
          
        case "/kick":
          
          break
          
        case "/quit":
          if(this.channelStore.activeChatData === null){
            Notify.create({
              type: 'negative',
              message: 'No active channel to leave!',
              position: 'top',
              timeout: 3000,
            })

            return
          }
          if(this.channelStore.activeChatData.isAdmin === false){
            Notify.create({
              type: 'negative',
              message: 'This is ADMIN ONLY command! Please use /cancel to leave the channel.',
              position: 'top',
              timeout: 3000,
            })

            return
          }

          messageService.handleQuitCancelCommand(this.channelStore.activeChatData.id)
          break
          
        case "/cancel":
          if(this.channelStore.activeChatData === null){
            Notify.create({
              type: 'negative',
              message: 'No active channel to leave!',
              position: 'top',
              timeout: 3000,
            })

            return
          }
          
          messageService.handleQuitCancelCommand(this.channelStore.activeChatData.id)
          break
          
        case "/list":
          this.$emit('view-members')
          break
        
        case "/shrug":
          if(this.channelStore.activeChatData === null){
            Notify.create({
              type: 'negative',
              message: 'You must be in a channel to send messages',
              position: 'top',
              timeout: 3000,
            })

            return
          }
          messageService.hahahihi(text)
          break
          
        default:
          if(this.channelStore.activeChatData === null){
            Notify.create({
              type: 'negative',
              message: 'You must be in a channel to send messages',
              position: 'top',
              timeout: 3000,
            })

            return
          }
          messageService.sendMessage(text)
          break
      }
    }
  },
}
</script>

<style scoped>
.typing-bar-container {
  width: 100%;
  max-width: min(1200px, var(--content-available, 100vw));
  margin: 0 auto;
  position: relative;
}

.typing-bar {
  width: 100%;
  box-sizing: border-box;
}

/* Command Menu */
.command-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  max-height: 350px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.command-item {
  transition: background-color 0.15s;
  border-radius: 4px;
  margin: 2px 4px;
  cursor: pointer;
}

.command-item:hover {
  background-color: rgba(219, 136, 194, 0.1);
}

.command-item-active {
  background-color: rgba(219, 136, 194, 0.2);
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>