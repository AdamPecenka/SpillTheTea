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
import { Notify, Dialog } from 'quasar';
import { useUserStore } from 'src/store/useUserStore';

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
          desc: 'Vytvorenie kanala / Vstupenie do verejneho kanala',
          icon: 'login',
          args: '<channel-name>'
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
        },
        { 
          cmd: '/help', 
          desc: 'Zobrazenie tohto help menu',
          icon: 'help',
          args: ''
        },
        { 
          cmd: '/notify', 
          desc: 'Poslanie demo notifikacie (if not DND)',
          icon: 'notifications',
          args: ''
        }
      ],
      members: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack']
    }
  },
  
  props: {
    placeholder: { type: String, default: 'Type a message...' }
  },
  
  computed: {
    userStatus() {
      const userstore = useUserStore()
      return userstore.user?.status || 'offline'
    },
    
    filteredCommands() {
      if (!this.commandSearch && this.message === '/') {
        return this.commands
      }
      
      if (!this.commandSearch) {
        return []
      }
      
      const search = this.commandSearch.toLowerCase()
      return this.commands.filter(cmd => 
        cmd.cmd.toLowerCase().includes('/' + search) || 
        cmd.desc.toLowerCase().includes(search)
      )
    }
  },
  
  methods: {
    onMessageChange(value) {
      console.log('Message changed:', value)
      
      // Check if message starts with /
      if (value && value.startsWith('/')) {
        console.log('Starts with /')
        this.showCommandMenu = true
        
        // Extract search term (everything after / until space)
        const parts = value.slice(1).split(' ')
        this.commandSearch = parts[0]
        this.selectedCommandIndex = 0
        
        console.log('Command search:', this.commandSearch)
        console.log('Filtered commands:', this.filteredCommands.length)
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
      console.log('Selected command:', cmd.cmd)
      
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
    
    onSend() {
      const text = this.message.trim()
      if (!text) return

      const cmd = text.split(' ')[0]

      switch(cmd){
        case "/join":
          Notify.create({
            message: 'Join command - coming soon!',
            color: 'info',
            position: 'top'
          })
          break
          
        case "/invite":
          Notify.create({
            message: 'Invite command - coming soon!',
            color: 'info',
            position: 'top'
          })
          break
          
        case "/revoke":
          Notify.create({
            message: 'Revoke command - coming soon!',
            color: 'info',
            position: 'top'
          })
          break
          
        case "/kick":
          Notify.create({
            message: 'Kick command - coming soon!',
            color: 'info',
            position: 'top'
          })
          break
          
        case "/quit":
          Notify.create({
            message: 'Quit command - coming soon!',
            color: 'info',
            position: 'top'
          })
          break
          
        case "/cancel":
          Notify.create({
            message: 'Cancel command - coming soon!',
            color: 'info',
            position: 'top'
          })
          break
          
        case "/list":
          Dialog.create({
            title: 'Channel Members',
            message: `<ul style="padding-left: 1rem; list-style: none;">
              ${this.members.map(m => `
                <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; line-height: 1.5;">
                  <i class="material-icons" style="font-size: 1.5rem;">person</i> ${m}
                </li>
              `).join('')}
            </ul>`,
            html: true,
            ok: true,
            persistent: true
          })
          break
          
        case "/help":
          Dialog.create({
            title: 'Available Commands',
            message: `<ul style="padding-left: 1rem;">
              ${this.commands.map(c => `<li><b>${c.cmd}</b> ${c.args || ''}: ${c.desc}</li>`).join('')}
            </ul>`,
            html: true,
            ok: true,
            persistent: true
          })
          break
          
        case "/notify":
          if(this.userStatus !== 'dnd') {
            Notify.create({
              message: 'Vedel si o t...',
              caption: '@Tyty',
              position: 'bottom-right',
              color: 'primary',
              progress: true,
              timeout: 2000
            })
          } else {
            Notify.create({
              message: 'Notifications are disabled (DND mode)',
              color: 'warning',
              position: 'top',
              timeout: 2000
            })
          }
          break
          
        default:
          console.log(`[i] Message sent: ${this.message}`)
          break
      }
      
      this.message = ''
      this.showCommandMenu = false
    }
  }
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