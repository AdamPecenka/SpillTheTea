/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
<<<<<<< HEAD
import transmit from '@adonisjs/transmit/services/main'
=======
import AuthController from '#controllers/auth_controller'
>>>>>>> 1c02d582796b84558482741d0fde1b2d43e652e0

/*
|--------------------------------------------------------------------------
| WebSocket endpoint
|--------------------------------------------------------------------------
*/
router.get('/__transmit/events', () => transmit.streamController())

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

<<<<<<< HEAD
/*
|--------------------------------------------------------------------------
| API routes (DOČASNE BEZ AUTENTIFIKÁCIE - len na testovanie)
|--------------------------------------------------------------------------
*/
router.group(() => {
  // Channels
  router.get('/channels', '#controllers/channels_controller.index')
  router.post('/channels', '#controllers/channels_controller.store')
  router.get('/channels/:id', '#controllers/channels_controller.show')
  router.put('/channels/:id', '#controllers/channels_controller.update')
  router.delete('/channels/:id', '#controllers/channels_controller.destroy')
  
  // Messages
  router.get('/channels/:channelId/messages', '#controllers/messages_controller.index')
  router.post('/channels/:channelId/messages', '#controllers/messages_controller.store')
  router.post('/channels/:channelId/typing', '#controllers/messages_controller.typing')
  
}).prefix('/api')  // ✅ Odstránené .middleware(middleware.auth())
=======

router.group(() => {
  router.post('register', [AuthController, 'register'])
  router.post('login', [AuthController, 'login'])
}).prefix('auth')
>>>>>>> 1c02d582796b84558482741d0fde1b2d43e652e0
