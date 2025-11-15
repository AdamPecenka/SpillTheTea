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
      default: 'offline'
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
  border: 2px solid rgba(0, 0, 0, 0.12);
  bottom: 0;
  right: 0;
}


.dot.online {
  background: #8ee16a;
}

.dot.away {
  background: #f2c037;
}

.dot.dnd {
  background: #e53935;
}

.dot.offline {
  background: #9e9e9e;
}

</style>