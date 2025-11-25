/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import AuthController from '#controllers/auth_controller'
import { middleware } from './kernel.js'

/*
|--------------------------------------------------------------------------
| WebSocket endpoint (Transmit)
|--------------------------------------------------------------------------
*/
// ✅ REGISTRUJ ROUTE - Transmit v1 automaticky neregistruje!
try {
  // Transmit v2 má registerRoutes()
  if (typeof transmit.registerRoutes === 'function') {
    transmit.registerRoutes()
    console.log('✅ Transmit routes registered via registerRoutes()')
  } else {
    // Transmit v1 nemá registerRoutes - musíme manuálne
    console.log('⚠️ transmit.registerRoutes() not available, using manual route')
  }
} catch (e) {
  console.log('⚠️ Error registering Transmit routes:', e.message)
}

/*
|--------------------------------------------------------------------------
| Health check
|--------------------------------------------------------------------------
*/
router.get('/', async () => {
  return {
    hello: 'world',
    status: 'API is running!'
  }
})

/*
|--------------------------------------------------------------------------
| Auth routes
|--------------------------------------------------------------------------
*/
router.group(() => {
  router.post('register', [AuthController, 'register'])
  router.post('login', [AuthController, 'login'])
}).prefix('auth')

/*
|--------------------------------------------------------------------------
| API routes - S AUTH MIDDLEWARE
|--------------------------------------------------------------------------
*/
router.group(() => {
  // Channels
  router.get('/channels', '#controllers/channels_controller.index')
  router.post('/channels', '#controllers/channels_controller.store')
  router.get('/channels/:id', '#controllers/channels_controller.show')
  router.put('/channels/:id', '#controllers/channels_controller.update')
  router.delete('/channels/:id', '#controllers/channels_controller.destroy')
  
  // 🆕 Channel Member settings (isPinned, isAdmin, etc.)
  router.put('/channels/:channelId/members/:userId', '#controllers/channels_controller.updateMember')
  
  // Messages
  router.get('/channels/:channelId/messages', '#controllers/messages_controller.index')
  router.post('/channels/:channelId/messages', '#controllers/messages_controller.store')
  router.post('/channels/:channelId/typing', '#controllers/messages_controller.typing')
  
}).prefix('/api').use(middleware.auth())