<template>
  <div class="typing-bar row items-center q-pa-sm q-gutter-sm">
    <q-input
      v-model="message"
      filled
      rounded
      dense
      :placeholder="placeholder"
      @keyup.enter="onSend"
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
</template>

<script>
import { Notify } from 'quasar';
import { Dialog } from 'quasar';
import { useUserStore } from 'src/store/useUserStore';

export default {
  name: 'TypingBar',
  data() {
    return {
      message: ''
    }
  },
  props: {
    placeholder: { type: String, default: 'Type a message...' }
  },
  computed: {
    userStatus() {
      const userstore = useUserStore()
      return userstore.user.status 
    }
  },
  methods: {
    onSend() {
      const text = this.message.trim()
      if (!text) return

      const cmd = text.split(' ')[0]

      const members = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
      const commands = [
        { cmd: '/join', desc: 'Vytvorenie kanala / Vstupenie do verejneho kanala' },
        { cmd: '/invite', desc: 'Pridanie pouzivatela do kanala' },
        { cmd: '/revoke', desc: 'Odobratie pouzivatela z kanala' },
        { cmd: '/kick', desc: 'Vyhodenie clena kanala' },
        { cmd: '/quit', desc: 'Zrusenie kanala spravcom' },
        { cmd: '/cancel', desc: 'Opustenie kanala' },
        { cmd: '/list', desc: 'Zobrazenie zoznamu clenov kanala' },
        { cmd: '/help', desc: 'Zobrazenie tohto help menu' },
        { cmd: '/notify', desc: 'Poslanie demo notifikacie (if not DND)' }
      ]


      switch(cmd){
        case "/join":
          break;
        case "/invite":
          break;
        case "/revoke":
          break;
        case "/kick":
          break;
        case "/quit":
          break;
        case "/cancel":
          break;
        case "/list":
           Dialog.create({
            title: 'Channel Members',
            message: `<ul style="padding-left: 1rem; list-style: none;">
              ${members.map(m => `
                <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; line-height: 1.5;">
                  <i class="material-icons" style="font-size: 1.5rem;">person</i> ${m}
                </li>
              `).join('')}
            </ul>`,
            html: true,
            ok: true,
            persistent: true
          })
          break;
        case "/help":
          Dialog.create({
            title: 'Available Commands',
            message: `<ul style="padding-left: 1rem;">
              ${commands.map(c => `<li><b>${c.cmd}</b>: ${c.desc}</li>`).join('')}
            </ul>`,
            html: true,
            ok: true,
            persistent: true
          })
          break;
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
          }
          break;
        default:
          console.log(`[i] Message sent: ${this.message}`)
          break;
      }
      
      this.message = ''
    }
  }
}
</script>

<style scoped>
.typing-bar {
  width: 100%;
  max-width: min(1200px, var(--content-available, 100vw));
  margin: 0 auto;
  box-sizing: border-box;
}
</style>