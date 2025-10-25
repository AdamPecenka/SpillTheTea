<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 400px; max-width: 90vw;">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Create a New Channel</div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="channelName"
          label="Channel name"
          filled
          autofocus
        />
        <q-input
          v-model="channelTopic"
          label="Topic (optional)"
          filled
          class="q-mt-sm"
        />
        <q-toggle
          v-model="isPrivate"
          label="Private channel"
          color="primary"
          class="q-mt-md"
        />
        <q-toggle
          v-model="isPinned"
          label="Pinned channel"
          color="primary"
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" v-close-popup />
        <q-btn
          unelevated
          color="primary"
          label="Create"
          :disable="!channelName.trim()"
          @click="createChannel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { Notify } from 'quasar';
import { useDirectoryStore } from 'src/store/useDirectoryStore';

export default {
  name: 'ChannelCreateDialog',
  props: {
    modelValue: { type: Boolean, required: true }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      channelName: '',
      channelTopic: '',
      isPrivate: false,
      isPinned: false,
      channelStore: useDirectoryStore()
    }
  },
  computed: {
    isOpen: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) }
    }
  },
  methods: {
    createChannel() {
      const name = this.channelName.trim()
      if (!name) return

      const newChannel = {
        id: name.toLowerCase(),
        name,
        topic: this.channelTopic,
        members: Math.floor(Math.random() * 21), // random num, max 20 members
        isPrivate: this.isPrivate,
        isPinned: this.isPinned
      }

      this.channelStore.addChannel(newChannel)

      Notify.create({
        message: `Channel "${name}" created!`,
        color: 'positive',
        position: 'top'
      })

      this.channelName = ''
      this.channelTopic = ''
      this.isPrivate = false
      this.isPinned = false
      this.isOpen = false
    }
  }
}
</script>
