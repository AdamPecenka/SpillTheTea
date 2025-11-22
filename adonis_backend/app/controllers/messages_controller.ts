import type { HttpContext } from '@adonisjs/core/http'
import MessageLog from '#models/message_log'
import ChannelMember from '#models/channel_member'
import ChannelBannedMember from '#models/channel_banned_member'
import WebSocketService from '#services/websocket_service'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class MessagesController {
  /**
   * GET /api/channels/:channelId/messages - História správ
   * DOČASNE: Bez kontroly membership
   */
  async index({ params, request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 50)
    
    const messages = await MessageLog.query()
      .where('channel_id', params.channelId)
      .preload('sender')
      .orderBy('sent_timestamp', 'desc')
      .paginate(page, limit)
    
    return response.ok(messages)
  }

  /**
   * POST /api/channels/:channelId/messages - Poslať správu
   * DOČASNE: Používa hardcoded userId = 1
   */
  async store({ params, request, response }: HttpContext) {
    const { messageText } = request.only(['messageText'])
    
    // ⚠️ DOČASNE: Hardcoded user ID (prvý user z databázy)
    const userId = 1
    
    // Vytvor správu
    const message = await MessageLog.create({
      channelId: params.channelId,
      senderId: userId,
      messageText,
      sentTimestamp: DateTime.now()
    })
    
    await message.load('sender')
    
    // 🚀 BROADCAST správu všetkým v channeli
    await WebSocketService.broadcastMessage(message)
    
    return response.created(message)
  }

  /**
   * POST /api/channels/:channelId/typing - Typing indicator
   * DOČASNE: Používa hardcoded userId = 1
   */
  async typing({ params, request, response }: HttpContext) {
    const { isTyping } = request.only(['isTyping'])
    
    // ⚠️ DOČASNE: Hardcoded user ID
    const userId = 1
    const user = await User.findOrFail(userId)
    
    // 🚀 BROADCAST typing status
    WebSocketService.broadcastTyping(params.channelId, user, isTyping)
    
    return response.noContent()
  }
}