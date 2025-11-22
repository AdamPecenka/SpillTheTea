import transmit from '@adonisjs/transmit/services/main'
import Channel from '#models/channel'
import MessageLog from '#models/message_log'
import User from '#models/user'

export default class WebSocketService {
  /**
   * Broadcast nový channel všetkým pripojeným userom
   */
  static async broadcastChannelCreated(channel: Channel) {
    await channel.load('members') // Load members pre kompletné info
    
    transmit.broadcast('channels', {
      type: 'channel:created',
      data: channel.serialize()
    })
  }

  /**
   * Broadcast aktualizáciu channelu
   */
  static async broadcastChannelUpdated(channel: Channel) {
    await channel.load('members')
    
    transmit.broadcast('channels', {
      type: 'channel:updated',
      data: channel.serialize()
    })
  }

  /**
   * Broadcast vymazanie channelu
   */
  static broadcastChannelDeleted(channelId: number) {
    transmit.broadcast('channels', {
      type: 'channel:deleted',
      data: { channelId }
    })
  }

  /**
   * Broadcast novú správu do channelu
   */
  static async broadcastMessage(message: MessageLog) {
    await message.load('sender') // Load info o odosielateľovi
    
    transmit.broadcast(`channels/${message.channelId}`, {
      type: 'message:sent',
      data: message.serialize()
    })
  }

  /**
   * Broadcast typing indicator
   */
  static broadcastTyping(channelId: number, user: User, isTyping: boolean) {
    transmit.broadcast(`channels/${channelId}/typing`, {
      type: 'user:typing',
      data: {
        userId: user.id,
        username: user.username,
        isTyping
      }
    })
  }

  /**
   * Broadcast že user pridal/odobral membera
   */
  static async broadcastMemberJoined(channelId: number, user: User) {
    await user.refresh()
    
    transmit.broadcast(`channels/${channelId}`, {
      type: 'member:joined',
      data: {
        channelId,
        user: user.serialize()
      }
    })
  }

  static async broadcastMemberLeft(channelId: number, userId: number) {
    transmit.broadcast(`channels/${channelId}`, {
      type: 'member:left',
      data: {
        channelId,
        userId
      }
    })
  }

  /**
   * Notifikácia konkrétnemu userovi
   */
  static notifyUser(userId: number, notification: any) {
    transmit.broadcast(`users/${userId}/notifications`, {
      type: 'notification',
      data: notification
    })
  }
}