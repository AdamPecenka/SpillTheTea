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
  methods: {
    onSend() {
      const text = this.message.trim()
      if (!text) return

      const cmd = text.split(' ')[0]

      switch(cmd){
        case "/join":
        case "/invite":
        case "/revoke":
        case "/kick":
        case "/quit":
        case "/cancel":
        case "/list":
        case "/help":
        case "/notify":
          Notify.create({
            message: 'Vedel si o t...',
            caption: '@Tyty',
            position: 'bottom-right',
            color: 'primary',
            progress: true,
            timeout: 10000
          })
          break;
        default:
          console.log(`[i] Message sent: ${this.message}`)
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