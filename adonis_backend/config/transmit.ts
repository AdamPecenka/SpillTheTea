import { defineConfig } from '@adonisjs/transmit'

export default defineConfig({
  // Ping interval v sekundách
  pingInterval: '2m',
  
  // Transport layer (SSE alebo WebSocket)
  transport: null, // null = auto-detect
})