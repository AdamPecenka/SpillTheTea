import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Channel from '#models/channel'

export default class extends BaseSeeder {
  async run() {
    await Channel.updateOrCreate(
      { name: 'general' },
      {
        name: 'general',
        isPrivate: false,
        description: 'general purpose chat'
      }
    )
  }
}