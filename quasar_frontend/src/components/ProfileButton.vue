<template>
  <!-- celý blok je JEDNO tlačidlo na otvorenie profilu -->
  <q-btn
    flat no-caps unelevated
    class="profile-bar-btn"
    :aria-label="`Open profile of ${user?.nickname || 'user'}`"
    @click="$emit('click')"
  >
    <div class="row items-center q-gutter-md">

      <!-- textová časť (vľavo) -->
      <div class="column items-end">
        <div class="nick">@{{ user?.nickname || 'nickname' }}</div>

        <!-- stavová „pilulka“ je klikateľná – otvorí menu -->
        <div
          class="row items-center q-gutter-xs status-ctl cursor-pointer"
          @click.stop="menu = true"
        >
          <span class="dot" :class="user?.status || 'offline'"></span>
          <span class="status">{{ user?.status || 'offline' }}</span>
          <q-icon name="expand_more" size="16px" class="q-ml-xs" />
        </div>

        <!-- MENU na zmenu statusu -->
        <q-menu v-model="menu" anchor="bottom right" self="top right">
          <q-list separator style="min-width: 180px">
            <q-item clickable v-close-popup @click="set('online')">
              <q-item-section avatar><span class="dot online" /></q-item-section>
              <q-item-section>Online</q-item-section>
              <q-item-section side>
                <q-icon v-if="user?.status==='online'" name="check" />
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="set('away')">
              <q-item-section avatar><span class="dot away" /></q-item-section>
              <q-item-section>Away</q-item-section>
              <q-item-section side>
                <q-icon v-if="user?.status==='away'" name="check" />
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="set('dnd')">
              <q-item-section avatar><span class="dot dnd" /></q-item-section>
              <q-item-section>Do Not Disturb</q-item-section>
              <q-item-section side>
                <q-icon v-if="user?.status==='dnd'" name="check" />
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="set('offline')">
              <q-item-section avatar><span class="dot offline" /></q-item-section>
              <q-item-section>Offline</q-item-section>
              <q-item-section side>
                <q-icon v-if="user?.status==='offline'" name="check" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>

      <!-- avatar (vpravo) -->
      <q-avatar :size="avatarSize" class="avatar">
        <img v-if="user?.avatarUrl" :src="user!.avatarUrl" alt="avatar" />
        <div v-else class="avatar-ph" />
      </q-avatar>
    </div>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from 'src/store/useUserStore'

const props = withDefaults(defineProps<{ avatarSize?: string }>(), {
  avatarSize: '36px'
})
defineEmits<{ (e:'click'): void }>()

const userStore = useUserStore()
const menu = ref(false)

onMounted(() => { userStore.loadUser().catch(() => {}) })

const user = computed(() => userStore.user)

function set(s: 'online'|'away'|'dnd'|'offline') {
  userStore.setStatus(s)
}
</script>

<style scoped>
.profile-bar-btn { padding: 6px 10px; color: #fff; }
.nick { font-size: 14px; font-weight: 600; line-height: 1.1; }
.status { font-size: 12px; opacity: .9; }
.status-ctl:hover { opacity: .95; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot.online  { background: #8ee16a; }
.dot.away    { background: #f2c037; }
.dot.dnd     { background: #e53935; }
.dot.offline { background: #9e9e9e; }
.avatar-ph { width: 100%; height: 100%; background: #d9d9d9; border-radius: 50%; }
.avatar { background: transparent; border: none; }
</style>
