<template>
  <q-item clickable v-ripple @click="handleClick">
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

<script>
import StatusDot from 'components/StatusDot.vue'

export default {
  name: 'UserListItem',
  components: {
    StatusDot
  },
  props: {
    user: {
      type: Object,
      required: true,
      validator(value) {
        return typeof value.id === 'string' && 
               typeof value.name === 'string' &&
               (!value.status || ['online', 'away', 'dnd', 'offline'].includes(value.status))
      }
    }
  },
  computed: {
    statusColor() {
      switch (this.user.status) {
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
    },
    statusText() {
      switch (this.user.status) {
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
    },
    statusTextClass() {
      switch (this.user.status) {
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
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.user)
    }
  }
}
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