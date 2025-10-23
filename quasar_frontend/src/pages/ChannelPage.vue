<template>
  <q-page class="fit column">
    <div class="q-pa-sm bg-grey-2 text-weight-medium"># {{ channelName }}</div>
    <q-separator />
    <div class="col scroll">
      <MessageList :messages="messages" />
      <div v-if="loading" class="q-pa-md text-grey">Loading…</div>
      <div v-if="error"   class="q-pa-md text-negative">Error: {{ error }}</div>
    </div>
    <q-separator />
    <div class="row q-pa-sm q-gutter-sm">
      <q-input class="col" v-model="draft" dense :placeholder="`Message #${channelName}`" @keyup.enter="send"/>
      <q-btn label="Send" color="primary" @click="send"/>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDirectoryStore } from 'src/store/useDirectoryStore'
import { fetchChannelMessages } from 'src/services/messagesApi'
import MessageList from 'src/components/MessageList.vue'

const route = useRoute()
const directory = useDirectoryStore()

const messages = ref([])
const loading  = ref(false)
const error    = ref(null)
const draft    = ref('')

const channelName = computed(() => route.params.id)

async function load() {
  error.value = null; loading.value = true; messages.value = []
  try {
    await directory.loadChannels()
    const channelId = directory.channelBy(channelName.value)?.id || channelName.value
    messages.value = await fetchChannelMessages(channelId)
  } catch (e) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

function send(){
  const text = draft.value.trim()
  if (!text) return
  messages.value.push({
    id: 'loc-' + Math.random().toString(36).slice(2,9),
    author: 'Johanna',
    text,
    ts: Date.now(),
    thread: `channel:${channelName.value}`
  })
  draft.value = ''
}

onMounted(load)
watch(() => route.params.id, load)
</script>
