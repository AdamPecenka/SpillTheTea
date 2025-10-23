<template>
  <q-badge 
    floating 
    rounded
    :color="statusColor"
    class="status-dot"
  />
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'StatusDot',
  props: {
    status: {
      type: String,
      validator: (value) => {
        return ['online', 'away', 'dnd', 'offline'].includes(value);
      },
      default: 'offline' // Default status if none is provided
    }
  },
  computed: {
    statusColor() {
      switch (this.status) {
        case 'online':
          return 'positive';
        case 'away':
          return 'warning';
        case 'dnd':
          return 'negative';
        case 'offline':
        default:
          return 'grey-6';
      }
    }
  }
}
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