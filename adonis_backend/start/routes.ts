import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import ChannelsController from '#controllers/channels_controller'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'world',
    status: 'API is running!'
  }
})

router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])
}).prefix('/auth')


router.group(() => {
  router.get('/channels', [ChannelsController, 'getChannels'])
  router.get('/channels/:id/members', [ChannelsController, 'getChannelMembers'])








  router.post('/channels', '#controllers/channels_controller.store')
  router.get('/channels/:id', '#controllers/channels_controller.show')
  router.put('/channels/:id', '#controllers/channels_controller.update')
  router.delete('/channels/:id', '#controllers/channels_controller.destroy')
  
  router.put('/channels/:channelId/members/:userId', '#controllers/channels_controller.updateMember')

  router.get('/channels/:channelId/messages', '#controllers/messages_controller.index')
  router.post('/channels/:channelId/messages', '#controllers/messages_controller.store')
  router.post('/channels/:channelId/typing', '#controllers/messages_controller.typing')
  
}).prefix('/api').use(middleware.auth())