<template>
  <q-layout view="hHh LpR fFf">
    
    <!-- Top App Bar -->
    <q-header elevated class="bg-grey-9 items-center text-white">
      <q-toolbar>

        <img
          src="icons/tea_icon.png"
          style="width: 40px; height: 36px"
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

    <!-- Left Rail: Icons (Messages / Channels) -->
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

    <!-- Secondary Panel: zoznam DMs / Channels -->
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

      <!-- Channels List s kategóriami -->
      <div v-if="leftTab === 'channels'" class="panel-scroll">
        <ChannelList 
          :channels="filteredChannels"
          @channel-click="goChannel"
        />
      </div>

      <!-- DMs List s status guličkami -->
      <q-scroll-area v-else class="panel-scroll">
        <q-list padding>
          <UserListItem
            v-for="u in filteredFriends"
            :key="u.id"
            :user="u"
            @click="goDm"
          />
        </q-list>
      </q-scroll-area>
    </div>

        <!-- Right: Profile Drawer -->
    <q-drawer
      v-model="rightOpen"
      show-if-above
      side="right"
      :width="340"
      :breakpoint="1024"
      bordered
      class="bg-grey-2"
      behavior="desktop"
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
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </div>
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
import UserListItem from 'src/components/UserListItem.vue'
import ChannelList from 'src/components/ChannelList.vue'

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
    panelOpen.value = !panelOpen.value
  } else {
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
  [...dir.channels].sort((a, b) => {
    // Pinned na vrch
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    // Potom private
    if (a.isPrivate && !b.isPrivate) return -1
    if (!a.isPrivate && b.isPrivate) return 1
    // Nakoniec abecedne
    return a.name.localeCompare(b.name)
  })
)

const friendsSorted = computed(() =>
  [...dir.friends].sort((a, b) => {
    // Online na vrch
    const statusOrder = { online: 0, away: 1, dnd: 2, offline: 3 }
    const aStatus = statusOrder[a.status || 'offline']
    const bStatus = statusOrder[b.status || 'offline']
    if (aStatus !== bStatus) return aStatus - bStatus
    // Potom abecedne
    return a.name.localeCompare(b.name)
  })
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

/* Left Rail */
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

/* Secondary Panel */
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

/* Page content */
.q-page-container {
  padding-left: 72px;
  transition: padding-left 0.3s ease;
  height: calc(100vh - 64px - 50px);
}

.q-page-container.content-shifted {
  padding-left: 332px;
}

/* Right drawer */
.q-drawer--right {
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}

@media (max-width: 1024px) {
  .q-drawer--right {
    width: 100% !important;
    max-width: 340px;
  }
}

@media (min-width: 1025px) {
  .q-drawer--right {
    max-width: 400px;
  }
}

/* Tooltip */
.custom-tooltip {
  white-space: nowrap;
  font-size: 13px;
}

/* Responsive */
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
    transition: padding-right 0.3s ease;
}
  
  .q-page-container.content-shifted {
    padding-left: 0;
  }

  .q-page {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .fill-height {
    height: 100%;
  }
}
</style>