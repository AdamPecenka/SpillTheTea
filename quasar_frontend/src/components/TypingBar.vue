<template>
  <div class="typing-bar row items-center q-pa-sm q-gutter-sm">
    <q-input
      v-model="localValue"
      filled
      rounded
      dense
      :placeholder="placeholder"
      @keyup.enter="onSend"
      class="col"
      :disable="disabled"
    />
    <q-btn
      round
      dense
      :icon="sendIcon"
      color="primary"
      :disable="disabled || !canSend"
      @click="onSend"
    />
  </div>
</template>

<script>
export default {
  name: 'TypingBar',
  props: {
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: 'Type a message...' },
    sendIcon: { type: String, default: 'send' },
    clearOnSend: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'send'],
  computed: {
    localValue: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) }
    },
    canSend() { return (this.modelValue || '').trim().length > 0 }
  },
  methods: {
    onSend() {
      if (this.disabled) return
      const text = (this.modelValue || '').trim()
      if (!text) return
      this.$emit('send', text)
      if (this.clearOnSend) this.$emit('update:modelValue', '')
    }
  }
}
</script>

<style scoped>
.typing-bar {
  width: 100%;
  max-width: min(1200px, var(--content-available, 100vw));
  margin: 0 auto;
  box-sizing: border-box;
}
</style>