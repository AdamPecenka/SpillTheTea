<template>
  <q-page class="no-chat-selected column items-center justify-center">
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
  </q-page>
</template>

<script>
export default {
  name: 'IndexPage',

  computed: {
    indexContainerStyle () {
      // 64px = main header, 70px = typing bar (rovnako ako v ChatPage)
      return {
        maxHeight: 'calc(100vh - 64px - 70px)',
        width: '100%'
      }
    }
  }
}
</script>

<style scoped>
.no-chat-selected {
  flex: 1;
  background: #fafafa;
  box-sizing: border-box;
  padding: 32px 24px 90px; /* spodok kvôli typing baru */
}

.illustration-container {
  width: 100%;
  max-width: 480px;
}

/* obrázok sa škáluje celý, ale bez prázdneho miesta pod ním */
.chat-illustration {
  display: block;
  width: 100%;
  height: auto;
  max-height: 45vh;      /* obmedzenie podľa výšky okna */
  object-fit: contain;
  opacity: 0.9;
}

/* jemné zmenšenie pri nižšom okne / väčšom zoome */
@media (max-height: 800px) {
  .chat-illustration {
    max-height: 38vh;
  }
}

@media (max-height: 700px) {
  .chat-illustration {
    max-height: 32vh;
  }
}
</style>