<template>
  <q-layout view="hHh LpR fFf">
    
    <!-- Top App Bar -->
    <q-header elevated class="bg-grey-9 items-center text-white">
      <q-toolbar>

        <q-btn
          flat
          no-caps
          class="row items-center no-wrap q-pa-none"
          @click="goHome"
        >
          <img
            src="icons/tea_icon.png"
            style="width: 40px; height: 36px"
          />
          <q-toolbar-title class="q-ml-sm">
            <div class="text-weight-bold">Spill The Tea</div>
          </q-toolbar-title>
        </q-btn>

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
        
        <!-- DMs -->
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

        <!-- Channels -->
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

        <!-- Add channel dialog-->
        <q-btn
          round flat icon="add"
          :color="leftTab === 'add' ? 'primary' : 'grey-4'"
          @click="openChannelDialog"
          class="rail-btn"
        >
          <q-tooltip class="custom-tooltip" transition-show="jump-right" transition-hide="jump-left"
            anchor="center right" self="center left">
            Add Channel
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Add Channel Dialog -->
    <ChannelCreateDialog
      v-model="channelDialogOpen"
    />

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
        />
      </div>

      <!-- DMs List s status guličkami -->
      <q-scroll-area v-else class="panel-scroll">
        <q-list padding>
          <UserListItem
            v-for="u in filteredFriends"
            :key="u.id"
            :user="u"
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
        />
      </div>
    </q-drawer>

    

    <!-- Page Content -->
    <q-page-container
      :class="{ 'content-shifted': panelOpen }"
      :style="pageContainerStyle"
    >
      <q-page class="bg-grey-1">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component"  :page-style="pageContainerStyle" />
            </keep-alive>
          </router-view>
        </div>
      </q-page>
    </q-page-container>

    <q-page-sticky position="bottom" expand class="q-px-md q-pb-sm" :style="pageStyle">
      <div
        class="flex justify-center"
        style="width: 100%; max-width: var(--content-available, 1200px); margin: 0 auto;"
      >
        <TypingBar
          placeholder="Enter some command /"
        />
      </div>
    </q-page-sticky>
  </q-layout>
</template>

<script>
import { useRouter } from 'vue-router'
import { useDirectoryStore } from 'src/store/useDirectoryStore'
import ProfileButton from 'src/components/ProfileButton.vue'
import ProfileDrawer from 'src/components/ProfileDrawer.vue'
import UserListItem from 'src/components/UserListItem.vue'
import ChannelList from 'src/components/ChannelList.vue'
import SettingsPanel from 'src/components/SettingsPanel.vue'
import TypingBar from 'src/components/TypingBar.vue'
import ChannelCreateDialog from 'src/components/ChannelCreateDialog.vue'

export default {
  name: 'ChatLayout',
  
  components: {
    ProfileButton,
    ProfileDrawer,
    UserListItem,
    ChannelList,
    SettingsPanel,
    TypingBar,
    ChannelCreateDialog
  },
  
  data() {
    return {
      panelOpen: true,
      leftTab: 'dms',
      rightOpen: false,
      currentChannel: 'Channel name',
      channelDialogOpen: false,
      channelSearch: '',
      messageText: '',
      profile: {
        username: 'username',
        first: '',
        last: '',
        email: '',
        status: 'online'
      },
      dir: null,
      router: null
    }
  },
  
  computed: {
    leftListTitle() {
      return this.leftTab === 'channels' ? 'Channels' : 'Direct messages'
    },
    
    channelsSorted() {
      if (!this.dir || !this.dir.channels) return []
      
      return [...this.dir.channels].sort((a, b) => {
        // Pinned na vrch
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        // Potom private
        if (a.isPrivate && !b.isPrivate) return -1
        if (!a.isPrivate && b.isPrivate) return 1
        // Nakoniec abecedne
        return a.name.localeCompare(b.name)
      })
    },
    
    friendsSorted() {
      if (!this.dir || !this.dir.friends) return []
      
      return [...this.dir.friends].sort((a, b) => {
        // Online na vrch
        const statusOrder = { online: 0, away: 1, dnd: 2, offline: 3 }
        const aStatus = statusOrder[a.status || 'offline']
        const bStatus = statusOrder[b.status || 'offline']
        if (aStatus !== bStatus) return aStatus - bStatus
        // Potom abecedne
        return a.name.localeCompare(b.name)
      })
    },
    
    filteredChannels() {
      const q = this.channelSearch.trim().toLowerCase()
      if (!q) return this.channelsSorted
      
      return this.channelsSorted.filter(
        c => c.name.toLowerCase().includes(q) || 
             (c.topic || '').toLowerCase().includes(q)
      )
    },
    
    filteredFriends() {
      const q = this.channelSearch.trim().toLowerCase()
      if (!q) return this.friendsSorted
      
      return this.friendsSorted.filter(
        u => u.name.toLowerCase().includes(q) || 
             (u.status || '').toLowerCase().includes(q)
      )
    },
    pageContainerStyle() {
      const left = this.panelOpen ? 332 : 72      // 72 = rail, 260 = panel -> 72+260=332
      const right = this.rightOpen ? 340 : 0
      return {
        '--left-offset': `${left}px`,
        '--right-offset': `${right}px`,
        '--content-available': `calc(100vw - ${left}px - ${right}px)`
      }
    }
  },
  
  async mounted() {
    // Inicializácia store a router
    this.dir = useDirectoryStore()
    this.router = useRouter()
    
    // Načítanie data
    try {
      await Promise.all([
        this.dir.loadChannels(), 
        this.dir.loadFriends()
      ])
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  },
  
  methods: {
    togglePanel() {
      this.panelOpen = !this.panelOpen
    },
    
    onRailClick(tab) {
      if (this.leftTab === tab) {
        this.panelOpen = !this.panelOpen
      } else {
        this.leftTab = tab
        this.panelOpen = true
      }
    },

    openChannelDialog() {
      this.channelDialogOpen = true
    },
    
    onProfileSave(updated) {
      this.profile = { ...this.profile, ...updated }
    },

    goHome() {
      this.$router.push({ name: 'index' })
    }
  }
}
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

.q-page-sticky {
  z-index: 3000;
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
  padding-left: var(--left-offset, 72px);
  padding-right: var(--right-offset, 0px);
  transition: padding 0.24s ease;
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