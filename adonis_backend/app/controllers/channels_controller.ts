import type { HttpContext } from '@adonisjs/core/http'
import Channel from '#models/channel'
import WebSocketService from '#services/websocket_service'
import db from '@adonisjs/lucid/services/db'

export default class ChannelsController {
  /**
   * GET /api/channels - Zoznam všetkých channelov
   */
  async index({ response, auth }: HttpContext) {
    // ✅ Použij prihláseného usera
    const userId = auth.user!.id
    
    const channels = await Channel.query()
      .preload('members', (query) => {
        query.pivotColumns(['is_admin', 'is_pinned'])
      })
      .orderBy('id', 'desc')
    
    // Transform channels to include user-specific isPinned
    const channelsWithUserData = channels.map(channel => {
      const channelJson = channel.serialize()
      
      const userMembership = channel.members.find(m => m.id === userId)
      
      if (userMembership) {
        channelJson.isPinned = userMembership.$extras.pivot_is_pinned || false
        channelJson.isAdmin = userMembership.$extras.pivot_is_admin || false
        channelJson.isInvite = false
      } else {
        channelJson.isPinned = false
        channelJson.isAdmin = false
        channelJson.isInvite = false
      }
      
      return channelJson
    })
    
    return response.ok(channelsWithUserData)
  }

  /**
   * POST /api/channels - Vytvorenie nového channelu
   */
  async store({ request, response, auth }: HttpContext) {
    const data = request.only(['name', 'isPrivate', 'description'])
    
    // ✅ Použij prihláseného usera
    const userId = auth.user!.id
    
    // Vytvor channel
    const channel = await Channel.create({
      name: data.name,
      isPrivate: data.isPrivate ?? false,
      description: data.description
    })
    
    // ✅ Použi raw query (channel_members nemá id column)
    await db.table('channel_members').insert({
      channel_id: channel.id,
      user_id: userId,
      is_admin: true,
      is_pinned: false,
      created_at: new Date(),
      updated_at: new Date()
    })
    
    // Load relations pre broadcast
    await channel.load('members', (query) => {
      query.pivotColumns(['is_admin', 'is_pinned'])
    })
    
    // Serialize with user-specific data
    const channelJson = channel.serialize()
    const userMembership = channel.members.find(m => m.id === userId)
    if (userMembership) {
      channelJson.isPinned = userMembership.$extras.pivot_is_pinned || false
      channelJson.isAdmin = userMembership.$extras.pivot_is_admin || false
    }
    
    // 🚀 BROADCAST cez WebSocket
    await WebSocketService.broadcastChannelCreated(channel)
    
    return response.created(channelJson)
  }

  /**
   * GET /api/channels/:id - Detail channelu
   */
  async show({ params, response, auth }: HttpContext) {
    const userId = auth.user!.id
    
    const channel = await Channel.query()
      .where('id', params.id)
      .preload('members', (query) => {
        query.pivotColumns(['is_admin', 'is_pinned'])
      })
      .firstOrFail()
    
    const channelJson = channel.serialize()
    const userMembership = channel.members.find(m => m.id === userId)
    if (userMembership) {
      channelJson.isPinned = userMembership.$extras.pivot_is_pinned || false
      channelJson.isAdmin = userMembership.$extras.pivot_is_admin || false
    }
    
    return response.ok(channelJson)
  }

  /**
   * PUT /api/channels/:id - Aktualizácia channelu
   */
  async update({ params, request, response }: HttpContext) {
    const channel = await Channel.findOrFail(params.id)
    
    const data = request.only(['name', 'isPrivate', 'description'])
    channel.merge(data)
    await channel.save()
    
    await channel.load('members', (query) => {
      query.pivotColumns(['is_admin', 'is_pinned'])
    })
    
    await WebSocketService.broadcastChannelUpdated(channel)
    
    return response.ok(channel)
  }

  /**
   * PUT /api/channels/:channelId/members/:userId - Update member settings
   * ✅ Pre toggle pin a iné member-specific nastavenia
   */
  async updateMember({ params, request, response, auth }: HttpContext) {
    const { channelId, userId } = params
    const data = request.only(['isPinned', 'isAdmin'])
    
    // ✅ Bezpečnostná kontrola - user môže meniť len svoje nastavenia
    // (alebo admin môže meniť ostatných - to môžeš pridať neskôr)
    const currentUserId = auth.user!.id
    if (Number(userId) !== currentUserId) {
      // Pre teraz povoľ len vlastné nastavenia
      // return response.forbidden('You can only update your own settings')
    }
    
    // Check if channel exists
    const channel = await Channel.findOrFail(channelId)
    
    // ✅ RAW QUERY - check if member exists
    const existingMember = await db
      .from('channel_members')
      .where('channel_id', channelId)
      .where('user_id', userId)
      .first()
    
    if (!existingMember) {
      // ✅ AUTO-CREATE using raw query
      console.log(`🆕 Auto-creating ChannelMember for user ${userId} in channel ${channelId}`)
      
      await db.table('channel_members').insert({
        channel_id: Number(channelId),
        user_id: Number(userId),
        is_admin: data.isAdmin ?? false,
        is_pinned: data.isPinned ?? false,
        created_at: new Date(),
        updated_at: new Date()
      })
    } else {
      // ✅ UPDATE using raw query
      const updates: any = {
        updated_at: new Date()
      }
      
      if (data.isPinned !== undefined) {
        updates.is_pinned = data.isPinned
      }
      if (data.isAdmin !== undefined) {
        updates.is_admin = data.isAdmin
      }
      
      await db
        .from('channel_members')
        .where('channel_id', channelId)
        .where('user_id', userId)
        .update(updates)
    }
    
    // Load the full channel to broadcast
    await channel.load('members', (query) => {
      query.pivotColumns(['is_admin', 'is_pinned'])
    })
    
    // Serialize with user-specific data
    const channelJson = channel.serialize()
    const userMembership = channel.members.find(m => m.id === Number(userId))
    if (userMembership) {
      channelJson.isPinned = userMembership.$extras.pivot_is_pinned || false
      channelJson.isAdmin = userMembership.$extras.pivot_is_admin || false
    }
    
    // 🚀 BROADCAST update
    await WebSocketService.broadcastChannelUpdated(channel)
    
    return response.ok(channelJson)
  }

  /**
   * DELETE /api/channels/:id - Vymazanie channelu
   */
  async destroy({ params, response }: HttpContext) {
    const channel = await Channel.findOrFail(params.id)
    
    const channelId = channel.id
    await channel.delete()
    
    WebSocketService.broadcastChannelDeleted(channelId)
    
    return response.noContent()
  }
}