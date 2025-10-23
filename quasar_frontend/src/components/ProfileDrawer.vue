<template>
  <div class="profile-drawer full-height">
    <div class="q-pa-lg column justify-between full-height">
      <!-- Top -->
      <div>
        <div class="text-h6 q-mb-lg">Avatar</div>

        <!-- Avatar + nick -->
        <div class="column items-center q-gutter-sm q-mb-xl">
          <q-avatar size="160px" color="grey-4">
            <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="avatar" />
            <div v-else class="avatar-ph" />
          </q-avatar>
          <div class="text-subtitle1">@{{ user.nickname }}</div>
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
        <q-form v-else @submit.prevent="save" class="column q-gutter-md">
          <q-input
            label="Nickname"
            :model-value="user.nickname"
            dense
            filled
            readonly
          />
          <q-input v-model="edit.first" label="First name" dense filled />
          <q-input v-model="edit.last" label="Last name" dense filled />
          <q-input v-model="edit.email" label="E-mail address" type="email" dense filled />
        </q-form>
      </div>

      <!-- Bottom buttons -->
      <div class="column q-gutter-md q-pb-md items-center">
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
            @click="$emit('logout')"
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
  </div>
</template>

<script setup>
// ViewProfile.vue — minimal, mock data inside
import { reactive, ref, computed, onMounted } from 'vue'
import AvatarPic from 'src/assets/AvatarProfilePic.png'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'save', 'logout'])

const openProxy = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

// mock user (vymeníš za store alebo API)
const user = reactive({
  id: 'u-demo',
  nickname: 'nickname',
  first: '',
  last: '',
  email: '',
  avatarUrl: ''
})

const isEditing = ref(false)
const edit = reactive({ first: '', last: '', email: '' })

onMounted(async () => {
  // fake load
  await new Promise(r => setTimeout(r, 120))
  Object.assign(user, {
    nickname: 'johannatilesova',
    first: 'Johanna',
    last: 'Tiles',
    email: 'johanna@example.com',
    avatarUrl: AvatarPic
  })
})

function enterEdit () {
  edit.first = user.first || ''
  edit.last  = user.last  || ''
  edit.email = user.email || ''
  isEditing.value = true
}
function cancelEdit () {
  isEditing.value = false
}
function save () {
  user.first = edit.first
  user.last  = edit.last
  user.email = edit.email
  isEditing.value = false
  emit('save', { ...user })
}
</script>

<style scoped>
.avatar-ph {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #d9d9d9;
}

.profile-drawer {
  height: 100%;
}

/* čistý "list" štýl vo view mode */
.info-list .field { margin-bottom: 22px; }
.info-list .label { color: #2f2f2f; opacity: .9; margin-bottom: 10px; }
.info-list .value { color: #000; }


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
.btn-light { background: #d68ac3; color: #111; }
.btn-dark  { background: #111; color: #fff; }
</style>
