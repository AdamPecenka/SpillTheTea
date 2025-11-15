<template>
  <div class="profile-drawer">
    <!-- Scrollable Content -->
    <div class="profile-scroll-container">
      <div class="q-pa-lg column q-gutter-lg">
        <!-- Header with Settings -->
        <div>
          <div class="row items-center justify-between q-mb-lg">
            <!-- Settings Icon Button (vľavo) -->
            <q-btn
              flat
              round
              dense
              icon="settings"
              color="grey-7"
              @click="settingsOpen = true"
            >
              <q-tooltip>Settings</q-tooltip>
            </q-btn>
            
            <div class="text-h6">Profile</div>
            
            <!-- Close button (vpravo) -->
            <q-btn
              flat
              round
              dense
              icon="close"
              color="grey-7"
              @click="closeDrawer"
              
            >
              <q-tooltip>Close</q-tooltip>
            </q-btn>
          </div>

          <!-- Avatar + nick -->
          <div class="column items-center q-gutter-sm q-mb-xl">
            <ProfilePicture
              :image-url="user.avatarUrl"
              size="160px"
              :editable="!isEditing"
              alt="Your profile picture"
              @edit="openAvatarPicker"
            />
            <div class="text-subtitle1">@{{ user.username }}</div>
          </div>

          <!-- VIEW MODE -->
          <div v-if="!isEditing" class="column info-list">
            <div class="field">
              <div class="label">First name</div>
              <div class="value">{{ user.first || '—' }}</div>
            </div>
            <div class="field">
              <div class="label">Last name</div>
              <div class="value">{{ user.last || '—' }}</div>
            </div>
            <div class="field">
              <div class="label">E-mail address</div>
              <div class="value">{{ user.email || '—' }}</div>
            </div>
          </div>

          <!-- EDIT MODE -->
          <q-form 
            v-else @submit.prevent="save"
            class="column q-gutter-md">
            
            <q-input
              label="Username"
              :model-value="user.username"
              dense
              filled
              readonly
            />

            <q-input v-model="edit.first" label="First name" dense filled />
            <q-input v-model="edit.last" label="Last name" dense filled />
            <q-input v-model="edit.email" label="E-mail address" type="email" dense filled />
          </q-form>
        </div>
      </div>
    </div>

    <!-- Bottom buttons - FIXED -->
    <div class="profile-buttons-footer q-pa-lg">
      <div class="column q-gutter-md items-center">
        <!-- View -->
        <template v-if="!isEditing">
          <q-btn
            class="btn-light"
            label="Edit profile"
            no-caps
            @click="enterEdit"
          />
          <q-btn
            class="btn-dark"
            label="Log out"
            no-caps
            @click="onLogOut"
          />
        </template>

        <!-- Edit -->
        <template v-else>
          <q-btn
            class="btn-dark"
            label="Save changes"
            no-caps
            @click="save"
          />
          <q-btn flat no-caps 
            color="primary" 
            label="Cancel" 
            @click="cancelEdit"
            class="btn-cancel"
          />
        </template>
      </div>
    </div>

    <!-- Settings Panel -->
    <SettingsPanel
      v-model="settingsOpen"
      :settings="userSettings"
      :user-status="user.status"
      @update:settings="onSettingsUpdate"
    />

    <!-- Avatar Picker Dialog -->
    <AvatarPicker
      v-model="avatarPickerOpen"
      :current-avatar="user.avatarUrl"
      @select="onAvatarSelected"
    />
  </div>
</template>

<script>
import { useUserStore } from 'src/store/useUserStore'
import ProfilePicture from 'src/components/ProfilePicture.vue'
import SettingsPanel from 'src/components/SettingsPanel.vue'
import AvatarPicker from 'src/components/AvatarPicker.vue'
import AvatarPic from 'src/assets/AvatarProfilePic.png'

export default {
  name: 'ProfileDrawer',
  
  components: {
    ProfilePicture,
    SettingsPanel,
    AvatarPicker
  },
  
  props: {
    modelValue: { 
      type: Boolean, 
      default: false 
    }
  },
  
  emits: ['update:modelValue', 'save', 'logout'],
  
  data() {
    return {
      isEditing: false,
      settingsOpen: false,
      avatarPickerOpen: false,
      edit: {
        first: '',
        last: '',
        email: ''
      },
      userSettings: {
        onlyMentions: false
      },
      userStore: null
    }
  },
  
  computed: {
    openProxy: {
      get() {
        return this.modelValue
      },
      set(v) {
        this.$emit('update:modelValue', v)
      }
    },
    
    user() {
      const storeUser = this.userStore?.user
      if (!storeUser) {
        return {
          id: 'u-demo',
          username: 'Username',
          first: '',
          last: '',
          email: '',
          status: 'online',
          avatarUrl: AvatarPic
        }
      }
      return storeUser
    }
  },
  
  mounted() {
    this.userStore = useUserStore()
    if (typeof this.userStore.loadUser === 'function') {
      this.userStore.loadUser()
    }
    
    if (this.userStore.user?.settings) {
      this.userSettings = { ...this.userStore.user.settings }
    }
  },
  
  methods: {
    closeDrawer() {
      this.$emit('update:modelValue', false)
    },
    
    enterEdit() {
      this.edit.first = this.user.first || ''
      this.edit.last = this.user.last || ''
      this.edit.email = this.user.email || ''
      this.isEditing = true
    },
    
    cancelEdit() {
      this.isEditing = false
    },
    
    save() {
      // update store directly (or call an action if you have one)
      if (this.userStore.user) {
        this.userStore.user.first = this.edit.first
        this.userStore.user.last = this.edit.last
        this.userStore.user.email = this.edit.email
      }
      this.isEditing = false
      this.$emit('save', { ...this.user })
    },
    
    openAvatarPicker() {
      this.avatarPickerOpen = true
    },
    
    onAvatarSelected(avatarUrl) {
      // Update user avatar in store
      if (this.userStore.user) {
        this.userStore.user.avatarUrl = avatarUrl
      }
      
      this.$q.notify({
        message: 'Avatar updated!',
        color: 'positive',
        position: 'top',
        timeout: 2000,
        icon: 'check_circle'
      })
    },
    
    onSettingsUpdate(newSettings) {
      this.userSettings = { ...newSettings }
      
      // Save to store
      if (this.userStore.user) {
        this.userStore.user.settings = { ...newSettings }
      }
      
      // Emit to parent
      this.$emit('save', { ...this.user, settings: newSettings })
    },
    
    onLogOut(){
      this.userStore.isLogged = false
      this.$router.push({ name: 'login'})
    }
  }
}
</script>

<style scoped>
.profile-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.profile-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.profile-buttons-footer {
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
}

/* čistý "list" štýl vo view mode */
.info-list .field { 
  margin-bottom: 22px; 
}

.info-list .label { 
  color: #2f2f2f; 
  opacity: .9; 
  margin-bottom: 10px; 
}

.info-list .value { 
  color: #000; 
}

.btn-cancel {
  min-width: 240px;
  border-radius: 12px;
  padding: 12px 12px;
  font-size: 14px;
}

.btn-light,
.btn-dark {
  width: auto;
  min-width: 240px;
  background-clip: padding-box;
  background: #111;
  color: #fff;
  border-radius: 12px;
  padding: 12px 14px;
}

.btn-light { 
  background: #d68ac3; 
  color: #111; 
}

.btn-dark { 
  background: #111; 
  color: #fff; 
}
</style>