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
          @click="toggleProfileDrawer"
        />
      </q-toolbar>
    </q-header>

    <!-- Left Rail - Always visible -->
    <div class="left-rail bg-grey-10">
      <div class="column items-center q-pt-md q-gutter-sm full-height">
        <q-btn
          round flat icon="forum"
          :color="panelOpen || leftDrawerOpen ? 'primary' : 'grey-4'"
          @click="toggleChannels"
          class="rail-btn"
        >
          <q-tooltip class="custom-tooltip" transition-show="jump-right" transition-hide="jump-left"
            anchor="center right" self="center left">
            Channels
          </q-tooltip>
        </q-btn>

        <q-btn
          round flat icon="add"
          color="grey-4"
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

    <!-- Secondary Panel: Channel List - Works on both desktop and mobile -->
    <div 
      class="secondary-panel bg-grey-3"
      :class="{ 'panel-open': panelOpen || (isSmallScreen && leftDrawerOpen) }"
    >
      <div class="q-pa-md q-pb-none">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">Channels</div>
          <q-btn
            v-if="isSmallScreen"
            flat
            round
            dense
            icon="close"
            color="grey-7"
            @click="leftDrawerOpen = false"
          />
        </div>
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

      <div class="panel-scroll">
        <ChannelList :channels="filteredChannels" @channel-selected="isSmallScreen ? leftDrawerOpen = false : null" />
      </div>
    </div>

    <!-- Overlay for mobile when panel is open -->
    <div
      v-if="isSmallScreen && leftDrawerOpen"
      class="mobile-panel-overlay"
      @click="leftDrawerOpen = false"
    ></div>

    <!-- Desktop Profile Overlay - len pre profile mode na desktope -->
    <div
      v-if="!isSmallScreen && rightDrawerOpen && rightDrawerMode === 'profile'"
      class="desktop-profile-overlay"
      @click="rightDrawerOpen = false"
    ></div>

    <!-- Add Channel Dialog -->
    <ChannelCreateDialog v-model="channelDialogOpen" />

    <!-- Right Drawer - JEDEN drawer s dvoma režimami -->
    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      behavior="desktop"
      :overlay="isSmallScreen"
      elevated
      bordered
      class="bg-grey-2 drawer-under-header"
      :width="rightDrawerWidth"
    >
      <!-- Profile mode -->
      <ProfileDrawer
        v-if="rightDrawerMode === 'profile'"
        v-model="rightDrawerOpen"
        :user="profile"
        @save="onProfileSave"
      />

      <!-- Members mode -->
      <MemberListDrawer
        v-else-if="rightDrawerMode === 'members'"
        v-model="rightDrawerOpen"
        @kick-member="handleKickMember"
      />
    </q-drawer>

    <!-- Page Content -->
    <q-page-container :style="pageContainerStyle">
      <q-page class="bg-grey-1">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" @view-members="openMembersDrawer" />
            </keep-alive>
          </router-view>
        </div>
      </q-page>
    </q-page-container>

    <!-- Typing Bar -->
    <div class="typing-bar-fixed" :style="typingBarStyle">
      <div class="typing-bar-wrapper">
        <TypingBar 
          placeholder="message @someone or enter /command" 
          @view-members="openMembersDrawer"
          @show-notification="handleShowNotification"
        />
      </div>
    </div>
  </q-layout>
</template>

<script>
import { useRouter } from 'vue-router'
import { useChannelStore } from 'src/store/channelStore'
import { useQuasar } from 'quasar'
import ProfileButton from 'src/components/ProfileButton.vue'
import ProfileDrawer from 'src/components/ProfileDrawer.vue'
import MemberListDrawer from 'src/components/MemberListDrawer.vue'
import ChannelList from 'src/components/ChannelList.vue'
import TypingBar from 'src/components/TypingBar.vue'
import ChannelCreateDialog from 'src/components/ChannelCreateDialog.vue'

export default {
  name: 'ChatLayout',
  
  components: {
    ProfileButton,
    ProfileDrawer,
    MemberListDrawer,
    ChannelList,
    TypingBar,
    ChannelCreateDialog
  },
  
  data() {
    return {
      panelOpen: false,
      leftDrawerOpen: false,
      rightDrawerOpen: false,
      rightDrawerMode: null,
      channelDialogOpen: false,
      channelSearch: '',
      profile: {
        username: 'username',
        first: '',
        last: '',
        email: '',
        status: 'online'
      },
      dir: null,
      router: null,
    }
  },

  setup() {
    const $q = useQuasar()
    return { $q }
  },
  
  computed: {
    isSmallScreen() {
      return this.$q.screen.width < 768
    },

    channelsSorted() {
      if (!this.dir || !this.dir.channels) return []
      
      return [...this.dir.channels].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        if (a.isPrivate && !b.isPrivate) return -1
        if (!a.isPrivate && b.isPrivate) return 1
        return a.name.localeCompare(b.name)
      })
    },
    
    filteredChannels() {
      const q = this.channelSearch.trim().toLowerCase()
      if (!q) return this.channelsSorted

      return this.channelsSorted.filter(c => {
        return c.name.toLowerCase().startsWith(q)
      })
    },

    rightDrawerWidth() {
      if (this.isSmallScreen) {
        // Mobile: full width minus left rail, but minimum 280px
        const calculatedWidth = this.$q.screen.width - 60
        return Math.max(calculatedWidth, 280)
      }
      // Desktop: fixed width - same as secondary panel
      return 280
    },
    
    pageContainerStyle() {
      const left = this.panelOpen ? 332 : 72
      const right = (!this.isSmallScreen && this.rightDrawerOpen) ? 280 : 0
      
      return {
        paddingLeft: left + 'px',
        paddingRight: right + 'px',
        transition: 'padding 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
    
    typingBarStyle() {
      const left = this.panelOpen ? 332 : 72
      const right = (!this.isSmallScreen && this.rightDrawerOpen) ? 280 : 0
      
      return {
        left: left + 'px',
        right: right + 'px'
      }
    }
  },
  
  mounted() {
    this.dir = useChannelStore()
    this.router = useRouter()
    
    try {
      this.dir.loadChannels()
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  },
  
  methods: {
    toggleChannels() {
      // Desktop: toggle secondary panel
      if (!this.isSmallScreen) {
        this.panelOpen = !this.panelOpen
      } 
      // Mobile: toggle left drawer
      else {
        // Close right drawer if open
        if (this.rightDrawerOpen) {
          this.rightDrawerOpen = false
        }
        this.leftDrawerOpen = !this.leftDrawerOpen
      }
    },

    togglePanel() {
      this.panelOpen = !this.panelOpen
    },

    openChannelDialog() {
      this.channelDialogOpen = true
    },
    
    onProfileSave(updated) {
      this.profile = { ...this.profile, ...updated }
    },

    // PROFIL z horného toolbaru
    toggleProfileDrawer() {
      // Na mobile zavrieť left drawer ak je otvorený
      if (this.isSmallScreen && this.leftDrawerOpen) {
        this.leftDrawerOpen = false
      }
      
      if (this.rightDrawerMode === 'profile') {
        // Už sme v profile → len toggle open/close
        this.rightDrawerOpen = !this.rightDrawerOpen
      } else {
        // Prepnúť na profile mód a otvoriť
        this.rightDrawerMode = 'profile'
        this.rightDrawerOpen = true
      }
    },

    // MEMBERS z chat page (emit @view-members)
    openMembersDrawer() {
      // Na mobile zavrieť left drawer ak je otvorený
      if (this.isSmallScreen && this.leftDrawerOpen) {
        this.leftDrawerOpen = false
      }
      
      this.rightDrawerMode = 'members'
      this.rightDrawerOpen = true
    },

    goHome() {
      this.$router.push({ name: 'index' })
    },

    closeDrawers() {
      this.rightDrawerOpen = false
    },

    handleKickMember (member) {
      console.log('KICK:', member)
    },

    handleShowNotification(notificationData) {
      this.$q.notify({
        message: `${notificationData.username} in #${notificationData.channel}`,
        caption: notificationData.message,
        position: 'top-right',
        color: 'primary',
        timeout: 5000,
        avatar: notificationData.avatar || undefined,
        actions: [
          { icon: 'close', color: 'white', handler: () => {} }
        ]
      })
    }
  }
}
</script>

<style scoped>
/* Header - najvyšší z-index, prekrýva drawer */
.q-header {
  height: 64px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  z-index: 3000 !important;
}

.q-header .q-toolbar {
  height: 100%;
  display: flex;
  align-items: center;
}

/* Drawer pod headerom */
.drawer-under-header {
  position: fixed;
  top: 64px;                          /* výška headera */
  height: calc(100vh - 64px);
  z-index: 2000 !important;           /* pod headerom (3000), nad contentom */
}

/* Desktop Profile Overlay - len pre profile mode */
.desktop-profile-overlay {
  position: fixed;
  top: 64px;                          /* pod headerom */
  left: 0;
  right: 0;                           /* kľudne cez celý width – drawer je nad tým */
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1900;                      /* nad contentom, pod drawerom */
  cursor: pointer;
  /* žiadny transition → rýchlejší pocitovo */
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

/* Secondary Panel (Left) - Works on both desktop and mobile */
.secondary-panel {
  position: fixed;
  top: 64px;
  left: 72px;
  width: 260px;
  height: calc(100vh - 64px);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  z-index: 1400;
  transform: translateX(-100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.secondary-panel.panel-open {
  transform: translateX(0);
}

.panel-scroll {
  height: calc(100vh - 64px - 100px);
  overflow-y: auto;
}

/* Mobile panel overlay */
.mobile-panel-overlay {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1399;
  cursor: pointer;
}

/* Desktop Profile Overlay - len pre profile mode */
.desktop-profile-overlay {
  position: fixed;
  top: 64px;
  left: 0;
  right: 280px; /* width of right drawer */
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1900; /* Above content, below drawer */
  cursor: pointer;
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Page content */
.q-page-container {
  height: calc(100vh - 64px - 70px);
}

/* Typing Bar */
.typing-bar-fixed {
  position: fixed;
  bottom: 0;
  height: 70px;
  padding: 8px 16px;
  background: transparent;
  transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
              right 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1800; /* Below drawers */
  display: flex;
  justify-content: center;
  align-items: center;
}

.typing-bar-wrapper {
  width: 100%;
  max-width: 1200px;
}

/* Tooltip */
.custom-tooltip {
  white-space: nowrap;
  font-size: 13px;
}

/* Responsive helpers */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none !important;
}

/* Responsive */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: block !important;
  }

  /* Left rail stays but adjusts size slightly for mobile */
  .left-rail {
    width: 60px;
    z-index: 5001; /* Above secondary panel */
  }

  .rail-btn {
    width: 44px;
    height: 44px;
  }

  /* Secondary panel on mobile - slides out from behind left rail */
  .secondary-panel {
    left: 60px; /* Start after left rail */
    width: 280px;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    z-index: 5000;
    transform: translateX(calc(-100% - 60px)); /* Hide completely including the 60px offset */
  }

  .secondary-panel.panel-open {
    transform: translateX(0); /* Slide out to visible position */
  }

  /* When panel is open, overlay appears */
  .mobile-panel-overlay {
    z-index: 4999; /* Below secondary panel */
  }
  
  .q-page-container {
    padding-left: 60px !important; /* left rail width on mobile */
    padding-right: 0 !important;
  }
  
  /* Typing bar on mobile */
  .typing-bar-fixed {
    left: 60px !important;
    right: 0 !important;
    z-index: 1800; /* Below panels */
  }

  /* Right drawer na mobile - positioning */
  .drawer-under-header {
    min-width: 280px !important; /* Minimum width same as secondary panel */
    left: 60px !important; /* Start after left rail */
    top: 64px !important; /* Below header */
    height: calc(100vh - 64px) !important;
    z-index: 6000 !important; /* Above everything except header */
  }

  /* Show backdrop on mobile when drawer is open */
  .drawer-under-header :deep(.q-drawer__backdrop) {
    display: block !important;
    top: 64px !important;
    height: calc(100vh - 64px) !important;
  }

  /* Hide desktop profile overlay on mobile */
  .desktop-profile-overlay {
    display: none !important;
  }
}
</style>