import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserStatus } from '../../app/enums/UserStatusEnum.js'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.updateOrCreate(  
      { username: 'abracadabra' },
      {
        username: 'abracadabra',
        firstname: 'Abraca',
        lastname: 'Dabra',
        email: 'abraca@dabra.com',
        password: 'Heslo@123',
        status: UserStatus.ONLINE,
        mentionedNotify: true,
        avatarUrl: '/src/assets/avatars/avatar9.png'
      }
    )
  }
} 