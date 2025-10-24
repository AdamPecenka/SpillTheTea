<template>
  <div class="profile-picture-wrapper" :class="wrapperClass">
    <q-avatar 
      :size="size" 
      :class="avatarClass"
      class="profile-picture"
    >
      <!-- Ak má používateľ obrázok (memoji/fotka) -->
      <img 
        v-if="imageUrl && !imageError" 
        :src="imageUrl" 
        :alt="altText"
        @error="onImageError"
        class="profile-image"
      />
      
      <!-- Fallback - ikona persóny -->
      <q-icon 
        v-else
        name="person"
        :size="iconSize"
        :color="iconColor"
      />
      
      <!-- Status badge (voliteľný) -->
      <div 
        v-if="showStatus && status" 
        class="status-badge-container"
      >
        <StatusDot 
          :status="status" 
          :size="statusDotSize"
        />
      </div>
    </q-avatar>
    
    <!-- Edit button overlay (voliteľný) -->
    <div 
      v-if="editable" 
      class="edit-overlay"
      @click="handleEditClick"
    >
      <q-icon name="photo_camera" :size="editIconSize" color="white" />
    </div>
  </div>
</template>

<script>
import StatusDot from './StatusDot.vue'

export default {
  name: 'ProfilePicture',
  
  components: {
    StatusDot
  },
  
  props: {
    // URL k obrázku (memoji alebo fotka)
    imageUrl: {
      type: String,
      default: null
    },
    
    // User status pre status badge
    status: {
      type: String,
      default: null,
      validator: (value) => !value || ['online', 'away', 'dnd', 'offline'].includes(value)
    },
    
    // Veľkosť avatara (napríklad "36px", "120px", "3rem")
    size: {
      type: String,
      default: '44px'
    },
    
    // Zobraz status badge
    showStatus: {
      type: Boolean,
      default: false
    },
    
    // Je editovateľný (zobrazí edit overlay)
    editable: {
      type: Boolean,
      default: false
    },
    
    // Alt text pre obrázok
    alt: {
      type: String,
      default: 'Profile picture'
    },
    
    // Farba pozadia ak nie je obrázok
    backgroundColor: {
      type: String,
      default: 'grey-5'
    },
    
    // Farba ikony
    iconColor: {
      type: String,
      default: 'grey-9'
    }
  },
  
  emits: ['edit', 'click'],
  
  data() {
    return {
      imageError: false
    }
  },
  
  computed: {
    // Vypočítaj veľkosť ikony na základe veľkosti avatara
    iconSize() {
      const sizeNum = parseInt(this.size)
      if (isNaN(sizeNum)) return '24px'
      
      // Ikona je cca 55% veľkosti avatara
      const iconSizeNum = Math.round(sizeNum * 0.55)
      return `${iconSizeNum}px`
    },
    
    // Veľkosť status dotu podľa avatara
    statusDotSize() {
      const sizeNum = parseInt(this.size)
      if (isNaN(sizeNum)) return 'sm'
      
      if (sizeNum <= 32) return 'sm'
      if (sizeNum <= 60) return 'md'
      return 'lg'
    },
    
    // Veľkosť edit ikony
    editIconSize() {
      const sizeNum = parseInt(this.size)
      if (isNaN(sizeNum)) return '20px'
      
      // Edit ikona je cca 30% veľkosti avatara
      const editIconSizeNum = Math.round(sizeNum * 0.3)
      return `${Math.max(16, Math.min(40, editIconSizeNum))}px`
    },
    
    wrapperClass() {
      return {
        'is-editable': this.editable
      }
    },
    
    avatarClass() {
      return {
        [this.backgroundColor]: !this.imageUrl || this.imageError
      }
    },
    
    altText() {
      return this.alt || 'Profile picture'
    }
  },
  
  watch: {
    imageUrl() {
      // Reset error keď sa zmení URL
      this.imageError = false
    }
  },
  
  methods: {
    onImageError() {
      this.imageError = true
      console.warn('Failed to load profile picture:', this.imageUrl)
    },
    
    handleEditClick(event) {
      event.stopPropagation()
      this.$emit('edit')
    }
  }
}
</script>

<style scoped>
.profile-picture-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.profile-picture {
  transition: transform 0.2s ease;
  overflow: visible;
  border-radius: 50%;
  background: #d9d9d9;
}

.profile-picture:hover {
  transform: scale(1.05);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Status badge positioning - centered on bottom edge */
.status-badge-container {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  background: white;
  border-radius: 50%;
  padding: 2px;
}

/* Edit overlay */
.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.is-editable:hover .edit-overlay {
  opacity: 1;
}

/* Responsive hover effects */
@media (hover: hover) {
  .profile-picture-wrapper:hover .profile-picture {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

/* Disable transform on mobile */
@media (max-width: 599px) {
  .profile-picture:hover {
    transform: none;
  }
}
</style>