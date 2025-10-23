<template>
  <q-item clickable v-ripple @click="$emit('click', user)">
    <q-item-section avatar>
      <q-avatar size="40px" color="grey-5">
        <q-icon name="person" color="grey-9" size="24px" />
        
        <StatusDot :status="user.status" />

      </q-avatar>
    </q-item-section>
    
    <q-item-section>
      <q-item-label class="text-weight-medium">{{ user.name }}</q-item-label>
      <q-item-label caption :class="statusTextClass">
        {{ statusText }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusDot from 'components/StatusDot.vue'


interface User {
  id: string
  name: string
  status?: 'online' | 'away' | 'dnd' | 'offline'
}

interface Props {
  user: User
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'click', user: User): void
}>()

// Farba guličky podľa statusu
const statusColor = computed(() => {
  switch (props.user.status) {
    case 'online':
      return 'positive' // zelená
    case 'away':
      return 'warning' // oranžová/žltá
    case 'dnd':
      return 'negative' // červená
    case 'offline':
    default:
      return 'grey-6' // sivá
  }
})

// Text statusu
const statusText = computed(() => {
  switch (props.user.status) {
    case 'online':
      return 'Online'
    case 'away':
      return 'Away'
    case 'dnd':
      return 'Do not disturb'
    case 'offline':
    default:
      return 'Offline'
  }
})

// Farba textu statusu
const statusTextClass = computed(() => {
  switch (props.user.status) {
    case 'online':
      return 'text-positive'
    case 'away':
      return 'text-warning'
    case 'dnd':
      return 'text-negative'
    case 'offline':
    default:
      return 'text-grey-6'
  }
})
</script>

<style scoped>
.status-badge {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  bottom: 0;
  right: 0;
}
</style>