import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import MessageLog from '#models/message_log'
import User from '#models/user'
import Channel from '#models/channel'
import ChannelMember from '#models/channel_member'

export default class MessagesController {
    public async getMessagesForChannel({ request, response }: HttpContext) {
        const channelId = request.param('id')
        const pageSize = request.input('pageSize', 20)
        const oldestTimestamp = request.input('oldestTimestamp', null)

        const query = db.from('message_logs')
            .join('users', 'message_logs.sender_id', '=', 'users.id')
            .join('channels', 'message_logs.channel_id', '=', 'channels.id')
            .where('message_logs.channel_id', channelId)
            .select(
                'message_logs.id as msgId',
                'users.username',
                'users.avatar_url',
                'message_logs.message_text as messageText',
                'message_logs.sent_timestamp as sentTimestamp',
                'channels.name as channelName'
            )

        if (oldestTimestamp) {
            query.andWhere('message_logs.sent_timestamp', '<', oldestTimestamp)
        }

        query.orderBy('message_logs.sent_timestamp', 'desc')
            .limit(pageSize)

        const messages = await query

        if (!messages) {
            return response.ok([])
        }

        const result = messages.map((msg) => ({
            id: msg.msgId,
            senderName: msg.username,
            senderAvatarUrl: msg.avatar_url,
            messageText: msg.messageText,
            sentTimestamp: msg.sentTimestamp,
            channelName: msg.channelName,
        }))

        return response.ok(result)
    }

    public async sendMessage(data: { channelId: number, senderId: number, messageText: string }): Promise<any> {

        const inserted = await MessageLog.create({
            channelId: data.channelId,
            senderId: data.senderId,
            messageText: data.messageText,
            sentTimestamp: DateTime.now()
        })

        const sender = await User.query()
            .where('id', data.senderId)
            .select('username', 'avatar_url')
            .first()

        const channelName = await Channel.query()
            .where('id', data.channelId)
            .select('name')
            .first()

        return {
            id: inserted.id,
            senderName: sender?.username,
            senderAvatarUrl: sender?.avatarUrl,
            messageText: inserted.messageText,
            sentTimestamp: inserted.sentTimestamp,
            channelName: channelName?.name,
            channelId: data.channelId
        }
    }

    public async getNewerMessages(userId: number,  newestTimestamps: { channelId: number, newestTimestamp: Date | null }[]){
        const channels = await ChannelMember.query()
            .where('user_id', userId)
            .select('channel_id')

        const result = []

        const tsLookup = newestTimestamps.reduce((acc, { channelId, newestTimestamp }) => {
            acc[channelId] = newestTimestamp
            return acc
        }, {} as Record<number, Date | null>)
        
        for (const ch of channels) {
            const channelId = ch.channelId
            const sinceTimestamp = tsLookup[channelId] ?? null

            const messagesQuery = db.from('message_logs')
                .join('users', 'users.id', '=', 'message_logs.sender_id')
                .join('channels', 'channels.id', '=', 'message_logs.channel_id')
                    .where('message_logs.channel_id', channelId)
                    .select([
                        'message_logs.id as id',
                        'users.username as senderName',
                        'users.avatar_url as senderAvatarUrl',
                        'message_logs.message_text as messageText',
                        'message_logs.sent_timestamp as sentTimestamp',
                        'channels.name as channelName'
                    ])
                    .orderBy('message_logs.sent_timestamp', 'asc')

            if (sinceTimestamp) {
                messagesQuery.where('message_logs.sent_timestamp', '>', sinceTimestamp)
            }

            const messages = await messagesQuery

            result.push({
                channelId,
                messages
            })
        }

        return result
    }
}