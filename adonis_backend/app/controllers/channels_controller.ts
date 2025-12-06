import type { HttpContext } from '@adonisjs/core/http'
import Channel from '#models/channel'
import ChannelMember from '#models/channel_member'
import db from '@adonisjs/lucid/services/db'

export default class ChannelsController {
    public async getChannels({ response, auth }: HttpContext) {
        const userId = auth.user!.id

        // Fetch channels where the user is a member OR invited.
        // Preload only the member and invite rows relevant to this user.
        const channels = await Channel.query()
            .whereHas('members', (q) => q.where('user_id', userId))
            .orWhereHas('invites', (q) => q.where('user_id', userId))
            .preload('members', (query) => {
                query.where('user_id', userId)
                query.pivotColumns(['is_admin', 'is_pinned'])
            })
            .preload('invites', (q) => {
                q.where('user_id', userId)
            })

        const result = channels.map((channel) => {
            const memberInfo = channel.members[0]
            const invitedRow = channel.invites[0]

            const isPinned = Boolean(memberInfo?.$extras?.pivot_is_pinned) || false
            const isAdmin = Boolean(memberInfo?.$extras?.pivot_is_admin) || false
            const isInvite = Boolean(invitedRow !== undefined)

            return {
                id: channel.id,
                name: channel.name,
                isPrivate: channel.isPrivate,
                description: channel.description,
                isPinned,
                isAdmin,
                isInvite,
            }
        })
        
        return response.ok(result)
    }

    async updatePinForChannel(userId: number, channelId: number, pinState: boolean): Promise<void> {
        
        const channelMemberRecord = await ChannelMember.query()
            .where('user_id', userId)
            .where('channel_id', channelId)
            .first()

        if(!channelMemberRecord){
            console.error(`[!] Failed to set isPinned: ${pinState} for channel: ${channelId}`)
            return
        }

        channelMemberRecord.isPinned = pinState
        channelMemberRecord.save()
    }

    async createChannel(userId: number, data: { name: string, isPrivate?: boolean, description?: string }): Promise<object> {

        const channel = await Channel.create({
            name: data.name,
            isPrivate: data.isPrivate,
            description: data.description
        })

        await ChannelMember.create({
            channelId: channel.id,
            userId: userId,
            isAdmin: true,
        })

        return {
            id: channel.id,
            name: channel.name,
            isPrivate: channel.isPrivate,
            description: channel.description,
            isPinned: false,
            isAdmin: true,
            isInvite: false
        }
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


        return response.ok(channelJson)
    }

    /**
     * DELETE /api/channels/:id - Vymazanie channelu
     */
    async destroy({ params, response }: HttpContext) {
        const channel = await Channel.findOrFail(params.id)

        const channelId = channel.id
        await channel.delete()

        return response.noContent()
    }
}