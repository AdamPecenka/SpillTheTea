import type { HttpContext } from '@adonisjs/core/http'
import Channel from '#models/channel'
import ChannelMember from '#models/channel_member'

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

    async getChannelIdsForUser(userId: number): Promise<number[]> {
        const channels = await Channel.query()
            .whereHas('members', (q) => q.where('user_id', userId))
            .select('id')

        return channels.map(channel => channel.id)
    }

    async getChannelMembers({ params, response }: HttpContext) {
        const channelId = Number(params.id)

        try {
            const channel = await Channel.findOrFail(channelId)

            const members = await channel
                .related('members')
                .query()
                .select('id', 'firstname', 'lastname', 'status')

            const result = members.map((m) => {
                const first = m.firstname?.trim() ?? ''
                const last = m.lastname?.trim() ?? ''
                const fullname = first + ' ' + last
                return {
                    id: m.id,
                    status: m.status,
                    fullname,
                }
            })

            return response.ok(result)
        } catch (error) {
            console.error('[!] Failed to load channel members', error)
            return response.notFound({ error: 'Channel not found' })
        }
    }
}