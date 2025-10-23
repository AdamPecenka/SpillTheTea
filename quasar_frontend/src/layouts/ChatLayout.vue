<template>
  <q-layout view="hHh LpR fFf">
    
    <!-- Top App Bar -->
    <q-header elevated class="bg-grey-9 items-center text-white">
      <q-toolbar>
        <img
          src="icons/tea_icon.png"
          style="width: 40px; height: 32px"
        />
        <q-toolbar-title>
          <div class="row items-center no-wrap">
            <div class="text-weight-bold">Spill The Tea</div>
          </div>
        </q-toolbar-title>
        <q-space />
        
        <ProfileButton
          :show-status="true"
          :show-status-text="true"
          :status-uppercase="true"
          @click="rightOpen = !rightOpen"
        />
      </q-toolbar>
    </q-header>

    <!-- Left Rail: Icons (Messages / Channels) - VŽDY VIDITEĽNÝ -->
    <div class="left-rail bg-grey-10">
      <div class="column items-center q-pt-md q-gutter-sm full-height">
        <q-btn
          round flat icon="chat"
          :color="leftTab === 'dms' ? 'primary' : 'grey-4'"
          @click="onRailClick('dms')"
          class="rail-btn"
        >
          <q-tooltip class="custom-tooltip" transition-show="jump-right" transition-hide="jump-left"
            anchor="center right" self="center left">
            Direct Messages
          </q-tooltip>
        </q-btn>

        <q-btn
          round flat icon="forum"
          :color="leftTab === 'channels' ? 'primary' : 'grey-4'"
          @click="onRailClick('channels')"
          class="rail-btn"
        >
          <q-tooltip class="custom-tooltip" transition-show="jump-right" transition-hide="jump-left"
            anchor="center right" self="center left">
            Channels
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Secondary Panel: zoznam DMs / Channels - VYSÚVA SA Z RAILU -->
    <div 
      class="secondary-panel bg-grey-3"
      :class="{ 'panel-open': panelOpen }"
    >
      <div class="q-pa-md q-pb-none">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">{{ leftListTitle }}</div>
        <q-input 
          dense 
          rounded 
          filled 
          placeholder="Search" 
          v-model="channelSearch" 
          prepend-inner-icon="search"
          bg-color="white"
        />
      </div>

      <q-scroll-area class="panel-scroll">
        <q-list padding v-if="leftTab === 'channels'">
          <q-item v-for="ch in filteredChannels" :key="ch.id" clickable v-ripple @click="goChannel(ch)">
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
          <q-item v-for="u in filteredFriends" :key="u.id" clickable v-ripple @click="goDm(u)">
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
    </div>

    <!-- Right: Profile Drawer -->
    <q-drawer
      v-model="rightOpen"
      show-if-above
      side="right"
      :width="340"
      :breakpoint="1440"
      class="bg-grey-2"
    >
      <div class="fit">
        <ProfileDrawer
          v-model="rightOpen"
          :user="profile"
          @save="onProfileSave"
          @logout="onLogout"
        />
      </div>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container :class="{ 'content-shifted': panelOpen }">
      <q-page class="bg-grey-1">
        <q-scroll-area class="fit">
          <div class="q-pa-md">
            <div class="text-h6 text-weight-bold q-mb-md">{{ currentChannel }}</div>
            <div class="text-body1">
              This is a placeholder for the channel content. The channel "{{ currentChannel }}" would display its messages here.
            </div>
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
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDirectoryStore } from 'src/store/useDirectoryStore'
import ProfileButton from 'src/components/ProfileButton.vue'
import ProfileDrawer from 'src/components/ProfileDrawer.vue'

// UI state
const panelOpen = ref(true)
const leftTab = ref<'dms' | 'channels'>('dms')
const rightOpen = ref(false)
const currentChannel = ref('Channel name')
const channelSearch = ref('')

// store
const dir = useDirectoryStore()
const router = useRouter()

// načítanie data
onMounted(async () => {
  await Promise.all([dir.loadChannels(), dir.loadFriends()])
})

function togglePanel() {
  panelOpen.value = !panelOpen.value
}

function onRailClick(tab: 'dms' | 'channels') {
  if (leftTab.value === tab) {
    // Ak klikneš na rovnakú ikonku, toggle panel
    panelOpen.value = !panelOpen.value
  } else {
    // Ak klikneš na inú ikonku, prepni tab a otvor panel
    leftTab.value = tab
    panelOpen.value = true
  }
}

function onProfileSave(updated) {
  profile.value = { ...profile.value, ...updated }
}

function onLogout() {
  console.log('logout clicked')
}

// zotriedené zoznamy
const channelsSorted = computed(() =>
  [...dir.channels].sort((a, b) => a.name.localeCompare(b.name))
)
const friendsSorted = computed(() =>
  [...dir.friends].sort((a, b) => a.name.localeCompare(b.name))
)

// filtrovanie
const filteredChannels = computed(() => {
  const q = channelSearch.value.trim().toLowerCase()
  if (!q) return channelsSorted.value
  return channelsSorted.value.filter(
    c => c.name.toLowerCase().includes(q) || (c.topic || '').toLowerCase().includes(q)
  )
})

const filteredFriends = computed(() => {
  const q = channelSearch.value.trim().toLowerCase()
  if (!q) return friendsSorted.value
  return friendsSorted.value.filter(
    u => u.name.toLowerCase().includes(q) || (u.status || '').toLowerCase().includes(q)
  )
})

// navigácia
function goChannel(ch: { id: string; name: string; topic?: string }) {
  currentChannel.value = ch.name
  router.push({ name: 'channel', params: { id: ch.name } })
}

function goDm(u: { id: string; name: string; status?: string }) {
  router.push({ name: 'dm', params: { id: u.id } })
}

// profil
const profile = ref({ nickname: 'nickname', first: '', last: '', email: '' })
const messageText = ref('')

const leftListTitle = computed(() => (leftTab.value === 'channels' ? 'Channels' : 'Direct messages'))
</script>

<style scoped>
/* Header */
.q-header {
  height: 64px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  z-index: 2000;
}

.q-header .q-toolbar {
  height: 100%;
  display: flex;
  align-items: center;
}

/* Left Rail - úzky panel s ikonkami, vždy viditeľný */
.left-rail {
  position: fixed;
  top: 64px;
  left: 0;
  width: 72px;
  height: calc(100vh - 64px);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  z-index: 1500;
}

.rail-btn {
  width: 48px;
  height: 48px;
}

/* Secondary Panel - široký panel so zoznamom, vysúva sa z railu */
.secondary-panel {
  position: fixed;
  top: 64px;
  left: 72px;
  width: 260px;
  height: calc(100vh - 64px);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  z-index: 1400;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.secondary-panel.panel-open {
  transform: translateX(0);
}

.panel-scroll {
  height: calc(100vh - 64px - 100px);
}

/* Page content - posúva sa keď je panel otvorený */
.q-page-container {
  padding-left: 72px;
  transition: padding-left 0.3s ease;
}

.q-page-container.content-shifted {
  padding-left: 332px; /* 72px rail + 260px panel */
}

/* Right drawer */
.q-drawer--right {
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}

/* Tooltip */
.custom-tooltip {
  white-space: nowrap;
  font-size: 13px;
}

/* Responsive - na mobiloch schovaj rail a použij overlay */
@media (max-width: 1024px) {
  .left-rail {
    width: 100%;
    height: auto;
    position: relative;
    top: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
  
  .secondary-panel {
    position: fixed;
    top: 64px;
    left: 0;
    width: 280px;
    transform: translateX(-100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
  
  .secondary-panel.panel-open {
    transform: translateX(0);
  }
  
  .q-page-container {
    padding-left: 0;
  }
  
  .q-page-container.content-shifted {
    padding-left: 0;
  }
}
</style>