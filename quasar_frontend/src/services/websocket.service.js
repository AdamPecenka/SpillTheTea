console.log('🔧 WebSocketService ULTRA-COMPATIBLE LOADED')

class WebSocketService {
  constructor() {
    this.client = null
    this.connected = false
    this.connecting = false  // 🆕 Ochrana proti race condition
    this.subscriptions = new Map()
  }

  /* Inicializuj Transmit client */
  async init(serverUrl) {
    // Ak už máme client, nevytváraj nový
    if (this.client) {
      console.log('⚠️ WebSocket already initialized')
      return this.client
    }

    // Ak práve prebieha inicializácia, počkaj
    if (this.connecting) {
      console.log('⏳ WebSocket initialization in progress...')
      // Počkaj kým sa dokončí
      while (this.connecting) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return this.client
    }

    this.connecting = true
    console.log('🔌 Initializing WebSocket:', serverUrl)
    
    try {
      // Import Transmit client
      const transmitModule = await import('@adonisjs/transmit-client')
      const Transmit = transmitModule.Transmit || transmitModule.default
      
      if (!Transmit) {
        console.error('❌ Failed to import Transmit client')
        this.connecting = false
        return null
      }
      
      // Vytvor client (DOČASNE bez auth - opravíme neskôr)
      this.client = new Transmit({
        baseUrl: serverUrl
      })
      
      console.log('✅ Transmit client initialized')
      this.connecting = false
      return this.client
      
    } catch (error) {
      console.error('❌ Failed to initialize Transmit:', error)
      this.connecting = false
      return null
    }
  }

  /* Pripoj sa do channelu */
  connectToChannels(callbacks = {}) {
    if (!this.client) {
      console.error('❌ Client not initialized! Call init() first')
      return
    }

    // Ak už máme subscription na channels, nevytváraj novú
    if (this.subscriptions.has('channels')) {
      console.log('⚠️ Already subscribed to channels')
      return this.subscriptions.get('channels')
    }

    console.log('📡 Subscribing to channels stream...')

    try {
      const subscription = this.client.subscription('channels')
      
      console.log('📋 Subscription object:', subscription)
      console.log('📋 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(subscription)))

      // onMessage - funguje vo všetkých verziách
      if (typeof subscription.onMessage === 'function') {
        subscription.onMessage((data) => {
          console.log('📨 Received message:', data)

          switch (data.type) {
            case 'channel:created':
              console.log('🆕 Channel created:', data.data)
              if (callbacks.onChannelCreated) {
                callbacks.onChannelCreated(data.data)
              }
              break

            case 'channel:updated':
              console.log('✏️ Channel updated:', data.data)
              if (callbacks.onChannelUpdated) {
                callbacks.onChannelUpdated(data.data)
              }
              break

            case 'channel:deleted':
              console.log('🗑️ Channel deleted:', data.data)
              if (callbacks.onChannelDeleted) {
                callbacks.onChannelDeleted(data.data)
              }
              break

            // 🆕 Handler pre member settings (isPinned, isAdmin)
            case 'member:settings_updated':
              console.log('📌 Member settings updated:', data.data)
              if (callbacks.onMemberSettingsUpdated) {
                callbacks.onMemberSettingsUpdated(data.data)
              }
              break

            default:
              console.log('❓ Unknown message type:', data.type)
          }
        })
        console.log('✅ onMessage handler set')
      } else {
        console.warn('⚠️ onMessage not available')
      }

      // Try onSubscription (v2+)
      if (typeof subscription.onSubscription === 'function') {
        console.log('✅ Using onSubscription (v2+)')
        subscription.onSubscription(() => {
          console.log('✅ Subscribed to channels (v2+)')
          this.connected = true
          if (callbacks.onConnected) {
            callbacks.onConnected()
          }
        })
      }
      // Try onSubscribed (v1)
      else if (typeof subscription.onSubscribed === 'function') {
        console.log('✅ Using onSubscribed (v1)')
        subscription.onSubscribed(() => {
          console.log('✅ Subscribed to channels (v1)')
          this.connected = true
          if (callbacks.onConnected) {
            callbacks.onConnected()
          }
        })
      }
      // No callback available
      else {
        console.log('⚠️ No subscription callback available')
        this.connected = true
        if (callbacks.onConnected) {
          setTimeout(() => callbacks.onConnected(), 100)
        }
      }

      // Error handling
      if (typeof subscription.onError === 'function') {
        subscription.onError((error) => {
          console.error('❌ Subscription error:', error)
          this.connected = false
          if (callbacks.onError) {
            callbacks.onError(error)
          }
        })
      }

      // Try create() (v2+)
      if (typeof subscription.create === 'function') {
        console.log('✅ Calling create() (v2+)')
        subscription.create()
      }
      // Try subscribe() (v1)
      else if (typeof subscription.subscribe === 'function') {
        console.log('✅ Calling subscribe() (v1)')
        subscription.subscribe()
      }
      // Try start()
      else if (typeof subscription.start === 'function') {
        console.log('✅ Calling start()')
        subscription.start()
      }
      else {
        console.warn('⚠️ No subscribe method found, subscription may not work')
      }

      this.subscriptions.set('channels', subscription)
      return subscription

    } catch (error) {
      console.error('❌ Failed to connect to channels:', error)
      if (callbacks.onError) {
        callbacks.onError(error)
      }
    }
  }

  /**
   * Pripoj sa na specific channel
   */
  connectToChannel(channelId, callbacks = {}) {
    if (!this.client) {
      console.error('❌ Client not initialized!')
      return
    }

    const channelName = `channels/${channelId}`
    console.log(`📡 Subscribing to ${channelName}...`)

    try {
      const subscription = this.client.subscription(channelName)

      subscription.onMessage((data) => {
        console.log(`📨 Message in channel ${channelId}:`, data)

        switch (data.type) {
          case 'message:sent':
            if (callbacks.onMessage) {
              window.dispatchEvent(new CustomEvent('new-message', {
                detail: data.data
              }))
              callbacks.onMessage(data.data)
            }
            break

          case 'member:joined':
            if (callbacks.onMemberJoined) {
              callbacks.onMemberJoined(data.data)
            }
            break

          case 'member:left':
            if (callbacks.onMemberLeft) {
              callbacks.onMemberLeft(data.data)
            }
            break
        }
      })

      // Compatible subscription
      if (typeof subscription.onSubscription === 'function') {
        subscription.onSubscription(() => {
          console.log(`✅ Subscribed to channel ${channelId}`)
        })
      } else if (typeof subscription.onSubscribed === 'function') {
        subscription.onSubscribed(() => {
          console.log(`✅ Subscribed to channel ${channelId}`)
        })
      }

      // Compatible start
      if (typeof subscription.create === 'function') {
        subscription.create()
      } else if (typeof subscription.subscribe === 'function') {
        subscription.subscribe()
      } else if (typeof subscription.start === 'function') {
        subscription.start()
      }

      this.subscriptions.set(channelName, subscription)
      return subscription

    } catch (error) {
      console.error(`❌ Failed to connect to channel ${channelId}:`, error)
    }
  }

  /**
   * Unsubscribe
   */
  unsubscribeFrom(channelName) {
    const subscription = this.subscriptions.get(channelName)
    if (subscription) {
      // Try all unsubscribe methods
      if (typeof subscription.delete === 'function') {
        subscription.delete()
      } else if (typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      } else if (typeof subscription.stop === 'function') {
        subscription.stop()
      }
      this.subscriptions.delete(channelName)
      console.log(`👋 Unsubscribed from ${channelName}`)
    }
  }

  /**
   * Disconnect all
   */
  disconnect() {
    console.log('👋 Disconnecting from Transmit...')
    
    this.subscriptions.forEach((subscription, channelName) => {
      if (typeof subscription.delete === 'function') {
        subscription.delete()
      } else if (typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      } else if (typeof subscription.stop === 'function') {
        subscription.stop()
      }
      console.log(`👋 Unsubscribed from ${channelName}`)
    })
    
    this.subscriptions.clear()
    this.connected = false
  }
}

// Export singleton instance
export default new WebSocketService()