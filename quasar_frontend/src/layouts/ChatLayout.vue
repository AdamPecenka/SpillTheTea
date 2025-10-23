<template>
  <q-layout view="hHh LpR fFf">
    
    <!-- Top App Bar -->
    <q-header elevated class="bg-grey-9 text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" class="q-mr-sm" @click="panelOpen = !panelOpen" />
        <q-toolbar-title>
          <div class="row items-center no-wrap">
            <div class="text-weight-bold">Spill The Tea</div>
          </div>
        </q-toolbar-title>
        <q-space />
        <q-btn dense flat icon="settings" label="Settings" class="text-white" />
        <q-btn flat dense round icon="account_circle" class="q-ml-sm" @click="rightOpen = !rightOpen" />
      </q-toolbar>
    </q-header>

    <!-- Left Rail: Icons (Channels / DMs) -->
    <q-drawer
      v-model="railOpen"
      show-if-above
      side="left"
      :width="72"
      :breakpoint="1024"
      class="bg-grey-10 text-white column items-center q-pt-md q-gutter-sm"
      boardered
    >
      <q-btn round flat icon="forum" :color="leftTab === 'channels' ? 'primary' : 'grey-4'" @click="leftTab = 'channels'; panelOpen = true">
        <q-tooltip
          class="custom-tooltip"
          transition-show="jump-right"
          transition-hide="jump-left"
          anchor="center right"
          self="center left"
        >
          Channels
        </q-tooltip>
      </q-btn>
      <q-btn round flat icon="chat" :color="leftTab === 'dms' ? 'primary' : 'grey-4'" @click="leftTab = 'dms'; panelOpen = true">
        <q-tooltip
          class="custom-tooltip"
          transition-show="jump-right"
          transition-hide="jump-left"
          anchor="center right"
          self="center left"
        >
          Direct messages
        </q-tooltip>
      </q-btn>
    </q-drawer>

    <!-- Left Panel: List according to selected tab -->
    <q-drawer
      v-model="panelOpen"
      show-if-above
      side="left"
      :width="260"
      :breakpoint="1024"
      class="bg-grey-3"
    >
      <div class="q-pa-md q-pb-none">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">{{ leftListTitle }}</div>
        <q-input dense rounded filled placeholder="Search" v-model="channelSearch" prepend-inner-icon="search" />
      </div>

      <q-scroll-area class="fit q-pt-sm">
        <q-list padding v-if="leftTab === 'channels'">
          <q-item v-for="ch in filteredChannels" :key="ch.id" clickable v-ripple @click="selectChannel(ch)">
            <q-item-section avatar>
              <q-avatar size="28px" color="grey-5" text-color="white">#</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ ch.name }}</q-item-label>
              <q-item-label caption>{{ ch.topic }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list padding v-else>
          <q-item v-for="u in filteredFriends" :key="u.id" clickable v-ripple>
            <q-item-section avatar>
              <q-avatar size="28px" color="grey-5">
                <q-icon name="person" color="grey-9" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ u.name }}</q-item-label>
              <q-item-label caption>{{ u.status }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Right: Profile Drawer -->
    <q-drawer
      v-model="rightOpen"
      show-if-above
      side="right"
      :width="340"
      :breakpoint="1440"
      class="bg-grey-2"
    >
      <div class="q-pa-md">
        <div class="text-subtitle1 text-weight-bold q-mb-md">Avatar</div>
        <div class="column items-center q-gutter-sm q-mb-md">
          <q-avatar size="120px" color="grey-4">
            <q-icon name="person" size="64px" color="grey-8" />
          </q-avatar>
          <div class="text-caption text-grey-7">@{{ profile.nickname || 'nickname' }}</div>
        </div>

        <q-form @submit.prevent>
          <q-input v-model="profile.nickname" label="Nickname" dense filled class="q-mb-sm" />
          <q-input v-model="profile.first" label="First name" dense filled class="q-mb-sm" />
          <q-input v-model="profile.last" label="Last name" dense filled class="q-mb-sm" />
          <q-input v-model="profile.email" label="E-mail address" type="email" dense filled class="q-mb-lg" />

          <div class="row q-gutter-sm">
            <q-btn label="Edit profile" color="primary" class="full-width" />
            <q-btn label="Log out" color="dark" outline class="full-width" />
          </div>
        </q-form>
      </div>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container>
      <q-page class="bg-grey-1">
        <q-scroll-area class="fit">
          <div class="q-pa-md">
            <!-- Chat preview placeholders (you can replace with your own chat later) -->
            <q-chat-message
              v-for="(m, i) in demoMessages"
              :key="i"
              :name="m.name"
              :text="[m.text]"
              :sent="m.sent"
              :stamp="m.time"
              :avatar="m.avatar"
              class="q-mb-sm"
            />
          </div>
        </q-scroll-area>
      </q-page>
    </q-page-container>

    <!-- Composer Bar -->
    <q-footer elevated class="bg-grey-9">
      <div class="row items-center q-pa-sm q-gutter-sm" style="max-width: 1200px; margin: 0 auto; width: 100%">
        <q-input v-model="messageText" filled class="col" rounded dense placeholder="Typing..." :disable="true"/>
        <q-btn round dense icon="send" color="primary" :disable="true" />
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// Define the interface first
interface Channel {
  id: number
  name: string
  topic?: string  // Make topic optional since it's not used in selectChannel
}

const railOpen = ref(true)
const panelOpen = ref(true)
const leftTab = ref('dms')
const rightOpen = ref(true)
const currentChannel = ref('Channel name')
const channelSearch = ref('')

const channels = ref([
  { id: 1, name: 'general', topic: 'Announcements' },
  { id: 2, name: 'random', topic: 'Off-topic' },
  { id: 3, name: 'design', topic: 'Figma & UX' },
  { id: 4, name: 'dev', topic: 'Frontend' },
  { id: 5, name: 'data', topic: 'Analytics' },
  { id: 6, name: 'memes', topic: 'Fun' }
])

const filteredChannels = computed(() => {
  const q = channelSearch.value.trim().toLowerCase()
  if (!q) return channels.value
  return channels.value.filter(c => c.name.toLowerCase().includes(q) || c.topic.toLowerCase().includes(q))
})

const friends = ref([
  { id: 1, name: 'Eliška', status: 'online' },
  { id: 2, name: 'Michal', status: 'last seen 5m' },
  { id: 3, name: 'Juraj', status: 'offline' },
  { id: 4, name: 'Adam', status: 'online' }
])

const filteredFriends = computed(() => {
  const q = channelSearch.value.trim().toLowerCase()
  if (!q) return friends.value
  return friends.value.filter(u => u.name.toLowerCase().includes(q) || (u.status || '').toLowerCase().includes(q))
})

const leftListTitle = computed(() => (leftTab.value === 'channels' ? 'Channels' : 'Direct messages'))

function selectChannel(ch: Channel) {
  currentChannel.value = `# ${ch.name}`
}

const profile = ref({ nickname: 'nickname', first: '', last: '', email: '' })
const messageText = ref('')

const demoMessages = ref([
  { name: 'Eliška', text: 'Wireframe ready ✨', time: '09:12', sent: false, avatar: '' },
  { name: 'Johanna', text: 'Idem spraviť layout v Quasare.', time: '09:13', sent: true, avatar: '' },
  { name: 'Michal', text: 'Super, potom prepojíme chat.', time: '09:16', sent: false, avatar: '' },
  { name: 'Johanna', text: 'OK, zatiaľ placeholdery.', time: '09:17', sent: true, avatar: '' }
])
</script>

<style scoped>
.q-drawer--left {
  border-right: 1px solid var(--q-color-grey-4);
}
.q-drawer--right {
  border-left: 1px solid var(--q-color-grey-4);
}
.panel-offset { left: 72px !important; }
.custom-tooltip {
  white-space: nowrap;
}
</style>