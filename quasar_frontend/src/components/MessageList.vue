<template>
  <div class="q-pa-md column gap-sm">
    <div v-for="m in messages" :key="m.id" class="row items-start q-gutter-sm">
      <q-avatar size="28px" icon="person" />
      <div>
        <div class="text-caption text-grey-7">
          <strong>{{ m.author }}</strong>
          <span class="q-ml-sm">{{ formatTime(m.ts) }}</span>
        </div>
        <div class="text-body2">{{ m.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ messages: { type:Array, default:()=>[] } })
function formatTime(ts){ try{ return new Date(ts).toLocaleString() } catch{ return '' } }
</script>
