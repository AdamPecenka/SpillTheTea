import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import MessageLog from '#models/message_log'
import User from '#models/user'
import Channel from '#models/channel'


export default class MessagesController {
    public async getMessagesForChannel({ request, response }: HttpContext) {
        const channelId = request.param('id')
        const pageNum = request.input('pageNum')
        const pageSize = request.input('pageSize')

        const messages = await db
            .from('message_logs')
                .join('users', 'message_logs.sender_id', '=', 'users.id')
                .join('channels', 'message_logs.channel_id', '=', 'channels.id')
                    .where('message_logs.channel_id', channelId)
                        .select(
                            'message_logs.id as msgId',
                            'users.username',
                            'message_logs.message_text as messageText',
                            'message_logs.sent_timestamp as sentTimestamp',
                            'channels.name as channelName'
                        )
                        .orderBy('message_logs.sent_timestamp', 'desc')
                        .paginate(pageNum, pageSize)

        if (!messages) {
            return response.ok([])
        }

        const result = messages.all().map((msg) => ({
            id: msg.msgId,
            senderName: msg.username,
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
            .select('username')
            .first()

        const channelName = await Channel.query()
            .where('id', data.channelId)
            .select('name')
            .first()

        return {
            id: inserted.id,
            senderName: sender?.username,
            messageText: inserted.messageText,
            sentTimestamp: inserted.sentTimestamp,
            channelName: channelName?.name,
            channelId: data.channelId
        }
    }
}