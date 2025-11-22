<!-- src/components/ChannelCreateDialog.vue -->
<!-- KOMPLETNÝ SÚBOR -->

<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Create New Channel</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- Názov channelu -->
        <q-input
          v-model="channelName"
          label="Channel name *"
          filled
          autofocus
          :rules="[val => !!val.trim() || 'Name is required']"
          @keyup.enter="createChannel"
        />

        <!-- Description -->
        <q-input
          v-model="description"
          label="Description (optional)"
          filled
          type="textarea"
          rows="3"
          class="q-mt-md"
        />

        <!-- Private checkbox -->
        <q-checkbox
          v-model="isPrivate"
          label="Private channel"
          class="q-mt-md"
        />
        <div class="text-caption text-grey-7 q-ml-md">
          Private channels require invitation to join
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey-7" @click="closeDialog" />
        <q-btn
          unelevated
          label="Create"
          color="primary"
          @click="createChannel"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDirectoryStore } from 'src/store/useDirectoryStore'

export default {
  name: 'ChannelCreateDialog',

  props: {
    modelValue: Boolean
  },

  emits: ['update:modelValue'],

  data() {
    return {
      channelName: '',
      description: '',
      isPrivate: false,
      loading: false
    }
  },

  methods: {
    async createChannel() {
      // Validácia
      if (!this.channelName.trim()) {
        this.$q.notify({
          message: 'Channel name is required',
          color: 'negative',
          position: 'top',
          timeout: 2000
        })
        return
      }

      this.loading = true

      try {
        const store = useDirectoryStore()

        // Vytvor channel
        const newChannel = await store.createChannel({
          name: this.channelName.trim(),
          isPrivate: this.isPrivate,
          description: this.description.trim() || undefined
        })

        // Success
        this.$q.notify({
          message: `Channel #${this.channelName} created!`,
          color: 'positive',
          position: 'top',
          timeout: 2000,
          icon: 'check_circle'
        })

        // Reset form
        this.channelName = ''
        this.description = ''
        this.isPrivate = false

        // Close dialog
        this.$emit('update:modelValue', false)

        // Navigate to new channel
        this.$router.push({ name: 'chat', params: { id: newChannel.id } })

      } catch (error) {
        console.error('Failed to create channel:', error)
        
        this.$q.notify({
          message: 'Failed to create channel',
          color: 'negative',
          position: 'top',
          timeout: 3000
        })
      } finally {
        this.loading = false
      }
    },

    closeDialog() {
      this.channelName = ''
      this.description = ''
      this.isPrivate = false
      this.$emit('update:modelValue', false)
    }
  }
}
</script>