import type { HttpContext } from '@adonisjs/core/http'
import Channel from '#models/channel'
import ChannelMember from '#models/channel_member'
import WebSocketService from '#services/websocket_service'

export default class ChannelsController {
  /**
   * GET /api/channels - Zoznam všetkých channelov
   * DOČASNE: Vráti všetky channels (bez filtrovania podľa usera)
   */
  async index({ response }: HttpContext) {
    const channels = await Channel.query()
      .preload('members')
      .orderBy('id', 'desc')
    
    return response.ok(channels)
  }

  /**
   * POST /api/channels - Vytvorenie nového channelu
   * DOČASNE: Používa hardcoded userId = 1
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(['name', 'isPrivate', 'description'])
    
    // ⚠️ DOČASNE: Hardcoded user ID (prvý user z databázy)
    const userId = 1
    
    // Vytvor channel
    const channel = await Channel.create({
      name: data.name,
      isPrivate: data.isPrivate ?? false,
      description: data.description
    })
    
    // Pridaj creator ako admin
    await ChannelMember.create({
      channelId: channel.id,
      userId: userId,
      isAdmin: true,
      isPinned: false
    })
    
    // Load relations pre broadcast
    await channel.load('members')
    
    // 🚀 BROADCAST cez WebSocket
    await WebSocketService.broadcastChannelCreated(channel)
    
    return response.created(channel)
  }

  /**
   * GET /api/channels/:id - Detail channelu
   */
  async show({ params, response }: HttpContext) {
    const channel = await Channel.query()
      .where('id', params.id)
      .preload('members')
      .firstOrFail()
    
    return response.ok(channel)
  }

  /**
   * PUT /api/channels/:id - Aktualizácia channelu
   * DOČASNE: Bez kontroly admin práv
   */
  async update({ params, request, response }: HttpContext) {
    const channel = await Channel.findOrFail(params.id)
    
    const data = request.only(['name', 'isPrivate', 'description'])
    channel.merge(data)
    await channel.save()
    
    await channel.load('members')
    
    // 🚀 BROADCAST update
    await WebSocketService.broadcastChannelUpdated(channel)
    
    return response.ok(channel)
  }

  /**
   * DELETE /api/channels/:id - Vymazanie channelu
   * DOČASNE: Bez kontroly admin práv
   */
  async destroy({ params, response }: HttpContext) {
    const channel = await Channel.findOrFail(params.id)
    
    const channelId = channel.id
    await channel.delete()
    
    // 🚀 BROADCAST delete
    WebSocketService.broadcastChannelDeleted(channelId)
    
    return response.noContent()
  }
}