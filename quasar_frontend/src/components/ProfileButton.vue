<template>
  <q-btn
    flat no-caps unelevated
    class="profile-bar-btn"
    :aria-label="`Open profile of ${getUserUsername}`"
    @click="handleClick"
  >
    <div class="row items-center q-gutter-sm">
      <!-- Text vľavo -->
      <div class="column items-end">
        <div class="nick">@{{ getUserUsername }}</div>
        
        <!-- Status dot - klikateľná, otvorí menu -->
        <div
          class="row items-center q-gutter-xs status-ctl cursor-pointer"
          @click.stop="menu = true"
        >
          <span class="dot" :class="getUserStatus"></span>
          <span class="status">{{ getUserStatus }}</span>
          <q-icon name="expand_more" size="16px" class="q-ml-xs" />
        </div>
        
        <!-- MENU na zmenu statusu -->
        <q-menu v-model="menu" anchor="bottom right" self="top right">
          <q-list separator style="min-width: 180px">
            <q-item clickable v-close-popup @click="setStatus('online')">
              <q-item-section avatar>
                <span class="dot online" />
              </q-item-section>
              <q-item-section>Online</q-item-section>
              <q-item-section side>
                <q-icon v-if="getUserStatus === 'online'" name="check" />
              </q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="setStatus('away')">
              <q-item-section avatar>
                <span class="dot away" />
              </q-item-section>
              <q-item-section>Away</q-item-section>
              <q-item-section side>
                <q-icon v-if="getUserStatus === 'away'" name="check" />
              </q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="setStatus('dnd')">
              <q-item-section avatar>
                <span class="dot dnd" />
              </q-item-section>
              <q-item-section>Do Not Disturb</q-item-section>
              <q-item-section side>
                <q-icon v-if="getUserStatus === 'dnd'" name="check" />
              </q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="setStatus('offline')">
              <q-item-section avatar>
                <span class="dot offline" />
              </q-item-section>
              <q-item-section>Offline</q-item-section>
              <q-item-section side>
                <q-icon v-if="getUserStatus === 'offline'" name="check" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      
      <!-- ProfilePicture komponent (vpravo) -->
      <ProfilePicture
        :image-url="user && user.avatarUrl"
        :status="getUserStatus"
        :show-status="false"
        size="36px"
        alt="Your profile"
      />
    </div>
  </q-btn>
</template>

<script>
import { useUserStore } from 'src/store/useUserStore'
import ProfilePicture from './ProfilePicture.vue'

export default {
  name: 'ProfileButton',
  
  components: {
    ProfilePicture
  },
  
  props: {
    avatarSize: {
      type: String,
      default: '36px'
    }
  },
  
  emits: ['click'],
  
  data() {
    return {
      menu: false,
      userStore: null
    }
  },
  
  computed: {
    user() {
      return this.userStore?.user || null
    },
    
    getUserUsername() {
      return this.user?.username || 'username'
    },
    
    getUserStatus() {
      return this.user?.status || 'offline'
    }
  },
  
  mounted() {
    this.userStore = useUserStore()
    this.userStore.loadUser()
  },
  
  methods: {
    handleClick() {
      this.$emit('click')
    },
    
    setStatus(status) {
      if (this.userStore) {
        this.userStore.setStatus(status)
      }
    }
  }
}
</script>

<style scoped>
.profile-bar-btn {
  padding: 6px 10px;
  color: #fff;
}

.nick {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.1;
}

.status {
  font-size: 12px;
  opacity: .9;
}

.status-ctl:hover {
  opacity: .95;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot.online {
  background: #8ee16a;
}

.dot.away {
  background: #f2c037;
}

.dot.dnd {
  background: #e53935;
}

.dot.offline {
  background: #9e9e9e;
}
</style>