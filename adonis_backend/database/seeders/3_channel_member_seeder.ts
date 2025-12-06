import { BaseSeeder } from '@adonisjs/lucid/seeders'
import ChannelMember from '#models/channel_member'

export default class extends BaseSeeder {
  async run() {
    await ChannelMember.updateOrCreate(
      { channelId: 1, userId: 1 },
      {
        channelId: 1,
        userId: 1,
        isAdmin: true,
        isPinned: false
      }
    )
  }
}