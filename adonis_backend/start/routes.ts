import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import AuthController from '#controllers/auth_controller'
import ChannelsController from '#controllers/channels_controller'
import MessagesController from '#controllers/messages_controller'

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

  router.get('channels/:id/messages', [MessagesController, 'getMessagesForChannel'])

}).prefix('/api').use(middleware.auth())