import { defineConfig } from '@adonisjs/transmit'

export default defineConfig({
  // Ping interval v sekundách
  pingInterval: 30,
  
  // Transport layer (SSE alebo WebSocket)
  transport: null, // null = auto-detect
})