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
          />
      </q-infinite-scroll>
    </div>
    
  </q-page>
</template>

<script>
import { ref } from 'vue';

export default{
  setup() {
    const messages = ref([
      { id: 1, name: 'Adam', text: 'Smrdis', sent: true },
      { id: 2, name: 'Johannka', text: 'Nieee :(', sent: false }
    ])

    return {
      messages,
      onLoad(index, done) {
        setTimeout(() => {
          const older = [
            { id: Date.now(), name: 'Adam', text: 'Earlier...', sent: true },
            { id: Date.now()+1, name: 'Johannka', text: 'Even earlier...', sent: false }
          ]
          messages.value.unshift(...older)
          done()
        }, 1000)
      }
    }
  }
}
</script>