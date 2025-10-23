<template>
  <div class="no-chat-selected column items-center justify-center">
    <div class="illustration-container q-mb-xl">
      <img 
        src="icons/chat-illustration.png" 
        alt="Chat illustration"
        class="chat-illustration"
      />
    </div>
    
    <div class="text-center q-px-md">
      <div class="text-h5 text-weight-medium text-grey-9 q-mb-sm">
        Start a conversation
      </div>
      <div class="text-body1 text-grey-7">
        Select a channel or direct message from the sidebar
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed
</script>

<style scoped>
.no-chat-selected {
  min-height: 100vh;
  padding: 2rem;
  background: #fafafa;
}

.illustration-container {
  max-width: 400px;
  opacity: 0.9;
}

.chat-illustration {
  width: 100%;
  height: auto;
}
</style>