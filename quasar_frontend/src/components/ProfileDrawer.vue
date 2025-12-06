<template>
  <div class="profile-drawer">
    <!-- Header with Settings - OUTSIDE scroll container -->
    <div class="profile-header">
      <div class="row items-center justify-between header-bar">
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
        
        <div class="text-h6 text-weight-medium">Profile</div>
        
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
    </div>

    <!-- Scrollable Content -->
    <div class="profile-scroll-container">
      <div class="q-pa-lg column q-gutter-lg">

        <!-- Avatar + nick -->
        <div class="column items-center q-gutter-sm q-mb-l">
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
            <div class="value">{{ user.firstname || '—' }}</div>
          </div>
          <div class="field">
            <div class="label">Last name</div>
            <div class="value">{{ user.lastname || '—' }}</div>
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

          <q-input v-model="edit.firstname" label="First name" dense filled />
          <q-input v-model="edit.lastname" label="Last name" dense filled />
          <q-input v-model="edit.email" label="E-mail address" type="email" dense filled />
        </q-form>
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
import { useAuthStore } from 'src/store/authStore'
import ProfilePicture from 'src/components/ProfilePicture.vue'
import SettingsPanel from 'src/components/SettingsPanel.vue'
import AvatarPicker from 'src/components/AvatarPicker.vue'

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
        firstname: '',
        lastname: '',
        email: ''
      },
      mentionedNotify: false,
      authStore: useAuthStore()
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
      return this.authStore.user
    }
  },
  
  mounted() {
    this.mentionedNotify = this.authStore.mentionedNotify
  },
  
  methods: {
    closeDrawer() {
      this.$emit('update:modelValue', false)
    },
    
    enterEdit() {
      this.edit.firstname = this.user.firstname || ''
      this.edit.lastname = this.user.lastname || ''
      this.edit.email = this.user.email || ''
      this.isEditing = true
    },
    
    cancelEdit() {
      this.isEditing = false
    },
    
    save() {
      // update store directly (or call an action if you have one)
      if (this.userStore.user) {
        this.userStore.user.firstname = this.edit.firstname
        this.userStore.user.lastname = this.edit.lastname
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
      if (this.authStore.user) {
        this.authStore.user.avatarUrl = avatarUrl
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
      this.authStore.logout()
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

/* 🔧 unify alignment for view & edit modes */
.profile-scroll-container .field,
.profile-scroll-container .q-input {
  width: 100%;
  max-width: 480px;       /* nech to má limit a nesahá dohora až ku kraju */
  margin-left: auto;
  margin-right: auto;
}

.profile-scroll-container .q-input .q-mb-l {
  margin-bottom: 16px;
}

.profile-scroll-container .q-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f5f5f5;
  padding: 6px 12px;
  min-height: 48px;
}

.profile-scroll-container .q-input :deep(.q-field__label) {
  padding-left: 4px;
  opacity: 0.8;
  font-weight: 500;
}

.profile-buttons-footer {
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
}

/* Profile Header - Fixed height 64px to match app header */
.profile-header {
  background: white;
  flex-shrink: 0;
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
}

.header-bar {
  width: 100%;
  padding: 0 16px;
  height: 64px;
  box-sizing: border-box;
}

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