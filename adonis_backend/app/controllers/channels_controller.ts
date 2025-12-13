import type { HttpContext } from '@adonisjs/core/http'
import Channel from '#models/channel'
import ChannelMember from '#models/channel_member'
import MessageLog from '#models/message_log'
import ChannelInvite from '#models/channel_invite'
import ChannelBannedMember from '#models/channel_banned_member'
import User from '#models/user'
import { setUncaughtExceptionCaptureCallback } from 'process'

export default class ChannelsController {
    async getChannels({ response, auth }: HttpContext) {
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

    async createChannel(userId: number, data: { name: string, isPrivate?: boolean, description?: string }): Promise<any> {

        const existing = await Channel.query()
            .where('name', data.name)
            .first()

        if (existing) { 
            return {
                ok: false,
                message: `Channel #${data.name} already exists!`,
            }
        }


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
            ok: true,
            channel: {
                id: channel.id,
                name: channel.name,
                isPrivate: channel.isPrivate,
                description: channel.description,
                isPinned: false,
                isAdmin: true,
                isInvite: false
            }
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
                .select('id', 'firstname', 'lastname', 'status', 'avatar_url')

            const result = members.map((m) => {
                const first = m.firstname?.trim() ?? ''
                const last = m.lastname?.trim() ?? ''
                const fullname = first + ' ' + last
                return {
                    id: m.id,
                    status: m.status,
                    fullname,
                    avatarUrl: m.avatarUrl
                }
            })

            return response.ok(result)
        } catch (error) {
            console.error('[!] Failed to load channel members', error)
            return response.notFound({ error: 'Channel not found' })
        }
    }

    async removeUserFromChannel(userId: number, channelId: number): Promise<void> {
        await ChannelMember.query()
            .where('user_id', userId)
            .andWhere('channel_id', channelId)
            .delete()
    }

    async deleteChannel(channelId: number): Promise<void> {
        await Channel.query()
            .where('id', channelId)
            .delete()
        
        await ChannelMember.query()
            .where('channel_id', channelId)
            .delete()

        await MessageLog.query()
            .where('channel_id', channelId)
            .delete()

        await ChannelInvite.query()
            .where('channel_id', channelId)
            .delete()

        await ChannelBannedMember.query()
            .where('channel_id', channelId)
            .delete()
    }

    async joinChannel(userId: number, channelName: string, isPrivate: boolean): Promise<any> {
        const channel = await Channel.findBy('name', channelName)

        if(channel){
            if(channel.isPrivate === true){
                return {
                    ok: false,
                    message: `Channel #${channelName} is private! You cannot join it`,
                }
            }

            const bannedEntries = await ChannelBannedMember
                .query()
                .where('channel_id', channel.id)    
                .andWhere('user_id', userId)

            const isHardBanned = bannedEntries.some(entry => entry.isBanned === true)

            const uniqueKickers = new Set(
                bannedEntries
                    .filter(entry => entry.kickedUserId)
                    .map(entry => entry.kickedUserId)
            )

            const isSoftBanned = uniqueKickers.size >= 3

            if (isHardBanned || isSoftBanned) {
                return {
                    ok: false,
                    message: `You are banned from #${channelName}`,
                }
            }

            const existingMembership = await ChannelMember.query()
                .where('user_id', userId)
                .andWhere('channel_id', channel.id)
                .first()

            if(existingMembership){ 
                return {
                    ok: false,
                    message: `You are already a member of channel #${channelName}`,
                }
            }

            await ChannelMember.create({
                channelId: channel.id,
                userId: userId,
                isAdmin: false,
            })

            const user = await User.findBy('id', userId)

            return {
                createdNewChannel: false,
                member:{
                    id: user?.id,
                    status: user?.status,
                    fullname: `${user?.firstname} ${user?.lastname}`,
                    avatarUrl: user?.avatarUrl
                },
                channel: {
                    id: channel.id,
                    name: channel.name,
                    isPrivate: channel.isPrivate,
                    description: channel.description,
                    isPinned: false,
                    isAdmin: false,
                    isInvite: false
                }
            }
        }

        const newChannel = await this.createChannel(userId, {name: channelName, isPrivate: isPrivate, description: ''})

        return {
            createdNewChannel: true,
            channel: {
                id: newChannel.channel.id,
                name: newChannel.channel.name,
                isPrivate: newChannel.channel.isPrivate,
                description: newChannel.channel.description,
                isPinned: newChannel.channel.isPinned,
                isAdmin: newChannel.channel.isAdmin,
                isInvite: newChannel.channel.isInvite
            }
        }
    }

    async inviteUser(channelId: number, username: string, myUserId: number) {
        const targetUser = await User.query()
            .where('username', username)
            .first()

        if(!targetUser) {
            return {
                ok: false,
                message: `Invalid username`,
            }
        }

        if(myUserId === targetUser.id){
            return {
                ok: false,
                message: `You cannot invite yourself :D`,
            }
        }
            
        const exists = await ChannelMember.query()
            .where('user_id', targetUser.id)
            .andWhere('channel_id', channelId)
            .first()

        if(exists) {
            return {
                ok: false,
                message: `User ${username} is already a member of this channel`,
            }
        }

        const inviteExists = await ChannelInvite.query()
            .where('user_id', targetUser.id)
            .where('channel_id', channelId)
            .first()

        if (inviteExists) {
            return {
                ok: false,
                message: `User ${username} already has a pending invite`,
            }
        }

        await ChannelInvite.create({
            userId: targetUser.id,
            channelId: channelId,
        })

        const channel = await Channel.findByOrFail('id', channelId)

        return {
            ok: true,
            targetUserId: targetUser.id,
            channel: {
                id: channel.id,
                name: channel.name,
                isPrivate: channel.isPrivate,
                description: channel.description,
                isPinned: false,
                isAdmin: false,
                isInvite: true
            }
        }
    }

    async acceptInvite(channelId: number, userId: number) {
        await ChannelInvite.query()
            .where('user_id', userId)
            .andWhere('channel_id', channelId)
            .delete()

        await ChannelMember.create({
            channelId: channelId,
            userId: userId,
            isAdmin: false,
            isPinned: false,
        })

        const user = await User.findBy('id', userId)

        return {
            id: user?.id,
            status: user?.status,
            fullname: `${user?.firstname} ${user?.lastname}`,
            avatarUrl: user?.avatarUrl
        }

    }

    async rejectInvite(channelId: number, userId: number) {
        await ChannelInvite.query()
            .where('user_id', userId)
            .andWhere('channel_id', channelId)
            .delete()
    }

    async revokeMember(channelId: number, username: string){
        const user = await User.query()
            .where('username', username)
            .select('id')
            .first()

        if(!user) {
            return{
                ok: false,
                message: 'User does not exist'
            }
        }

        const member = await ChannelMember.query()
            .where('user_id', user.id)
            .where('channel_id', channelId)
            .first()

        if (!member) {
            return {
                ok: false,
                message: 'User is not a member of this channel',
            }
        }

        await this.removeUserFromChannel(user.id, channelId)
        
        return {
            ok: true,
            userId: user.id
        }
    }
}