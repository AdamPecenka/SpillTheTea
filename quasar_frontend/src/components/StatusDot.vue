<template>
  <q-badge 
    floating 
    rounded
    :color="statusColor"
    class="status-dot"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status?: 'online' | 'away' | 'dnd' | 'offline'
}

const props = defineProps<Props>()

const statusColor = computed(() => {
  switch (props.status) {
    case 'online':
      return 'positive'
    case 'away':
      return 'warning'
    case 'dnd':
      return 'negative'
    case 'offline':
    default:
      return 'grey-6'
  }
})
</script>

<style scoped>
.status-dot {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  bottom: 0;
  right: 0;
}
</style>