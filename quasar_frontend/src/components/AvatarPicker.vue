<template>
  <q-dialog v-model="dialogOpen" persistent>
    <q-card style="min-width: 400px; max-width: 500px;">
      <q-card-section>
        <div class="text-h6 text-center">Change Avatar</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="avatar-grid">
          <div
            v-for="(avatar, index) in avatars"
            :key="index"
            class="avatar-option"
            :class="{ 'avatar-selected': selectedAvatar === avatar }"
            @click="selectAvatar(avatar)"
          >
            <img 
              v-if="avatar" 
              :src="avatar" 
              :alt="`Avatar ${index + 1}`"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <q-icon name="person" size="48px" color="grey-5" />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-md">
        <q-btn
          label="Cancel"
          flat
          color="grey-7"
          @click="cancel"
          class="q-px-lg"
        />
        <q-btn
          label="Select"
          unelevated
          color="primary"
          @click="confirmSelection"
          :disable="!selectedAvatar"
          class="q-px-lg"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
// Import avatar images
import Avatar1 from 'src/assets/avatars/avatar1.png'
import Avatar2 from 'src/assets/avatars/avatar2.png'
import Avatar3 from 'src/assets/avatars/avatar3.png'
import Avatar4 from 'src/assets/avatars/avatar4.png'
import Avatar5 from 'src/assets/avatars/avatar5.png'
import Avatar6 from 'src/assets/avatars/avatar6.png'
import Avatar7 from 'src/assets/avatars/avatar7.png'
import Avatar8 from 'src/assets/avatars/avatar8.png'
import Avatar9 from 'src/assets/avatars/avatar9.png'

export default {
  name: 'AvatarPicker',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    currentAvatar: {
      type: String,
      default: null
    }
  },
  
  emits: ['update:modelValue', 'select'],
  
  data() {
    return {
      selectedAvatar: null,
      avatars: [
        Avatar1,
        Avatar2,
        Avatar3,
        Avatar4,
        Avatar5,
        Avatar6,
        Avatar7,
        Avatar8,
        Avatar9
      ]
    }
  },
  
  computed: {
    dialogOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  
  watch: {
    modelValue(newVal) {
      if (newVal) {
        // Set current avatar as selected when dialog opens
        this.selectedAvatar = this.currentAvatar
      }
    }
  },
  
  methods: {
    selectAvatar(avatar) {
      this.selectedAvatar = avatar
    },
    
    confirmSelection() {
      if (this.selectedAvatar) {
        this.$emit('select', this.selectedAvatar)
        this.dialogOpen = false
      }
    },
    
    cancel() {
      this.dialogOpen = false
    }
  }
}
</script>

<style scoped>
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
}

.avatar-option {
  aspect-ratio: 1;
  border-radius: 16px;
  background: #e0e0e0;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
  border: 3px solid transparent;
}

.avatar-option:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-selected {
  border: 3px solid #db88c2;
  box-shadow: 0 0 0 2px rgba(219, 136, 194, 0.3);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

/* Responsive */
@media (max-width: 480px) {
  .avatar-grid {
    gap: 12px;
    padding: 12px;
  }
}
</style>