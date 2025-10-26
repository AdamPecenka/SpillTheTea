<template>
  <q-page class="flex column">
    <div 
      class="q-pa-md overflow-auto col"
      style="max-height: calc(100vh - 130px);"
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
  </q-page>
</template>

<script>
export default {
  name: 'ChatPage',

  data() {
    return {
      idCounter: 1,
      messages: []
    }
  },

  created() {
    for (let i = 0; i < 20; i++) {
      const isPing = Math.random() < 0.2

      this.addMessage(
        i % 2 === 0 ? 'abracadabra' : 'SuperUser123',
        i % 2 === 0 ? 'Smrdis' : 
          isPing ? '@abracadabra ty smrdis' : 'Nieeee :(',
        i % 2 === 0
      )
    }
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
          },
          {
            id: this.idCounter++,
            name: 'Adam',
            text: 'Even even earlier...',
            sent: true,
            stamp: Date.now() - 180000
          },
          {
            id: this.idCounter++,
            name: 'Johannka',
            text: 'Even even even earlier...',
            sent: false,
            stamp: Date.now() - 240000
          }
        ]
        this.messages.unshift(...older)
        done()
      }, 1000)
    }
  }
}
</script>

<style scoped>
.ping-highlight {
  background-color: rgba(219, 136, 194, 0.15);
  border-radius: 10px;
} 
</style>