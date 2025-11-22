// src/services/websocket.service.js
import { Transmit } from '@adonisjs/transmit-client'

class WebSocketService {
  constructor() {
    this.transmit = null
    this.channelsSubscription = null
    this.isConnected = false
  }

  /**
   * Inicializácia
   */
  init(baseUrl = 'http://localhost:3333') {
    if (this.transmit) {
      console.warn('⚠️ WebSocket already initialized')
      return
    }

    this.transmit = new Transmit({ baseUrl })
    console.log('✅ WebSocket client initialized')
  }

  /**
   * Pripojenie na channels stream
   */
  connectToChannels(callbacks = {}) {
    if (!this.transmit) {
      console.error('❌ Call init() first')
      return
    }

    if (this.channelsSubscription) {
      console.warn('⚠️ Already subscribed')
      return
    }

    const subscription = this.transmit.subscription('channels')
    subscription.create()

    subscription.onMessage((event) => {
      console.log('📨 Channel event:', event)

      switch (event.type) {
        case 'channel:created':
          callbacks.onChannelCreated?.(event.data)
          break
        case 'channel:updated':
          callbacks.onChannelUpdated?.(event.data)
          break
        case 'channel:deleted':
          callbacks.onChannelDeleted?.(event.data)
          break
      }
    })

    subscription.onSubscribed(() => {
      console.log('✅ Connected to channels')
      this.isConnected = true
      callbacks.onConnected?.()
    })

    subscription.onError((error) => {
      console.error('❌ WebSocket error:', error)
      this.isConnected = false
      callbacks.onError?.(error)
    })

    this.channelsSubscription = subscription
  }

  /**
   * Odpojenie
   */
  disconnect() {
    if (this.channelsSubscription) {
      this.channelsSubscription.delete()
      this.channelsSubscription = null
    }
    this.isConnected = false
    console.log('🔌 Disconnected')
  }

  get connected() {
    return this.isConnected
  }
}

export default new WebSocketService()