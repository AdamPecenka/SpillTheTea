import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import Channel from './channel.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class MessageLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'sender_id' })
  declare senderId: number
  
  @column({ columnName: 'channel_id' })
  declare channelId: number

  @column({ columnName: 'message_text' })
  declare messageText: string

  @column.dateTime({ columnName: 'sent_timestamp' })
  declare sentTimestamp: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ✅ OPRAVENÉ: Správny názov relation
  @belongsTo(() => User, {
    foreignKey: 'senderId',
  })
  public sender!: BelongsTo<typeof User>
  
  @belongsTo(() => Channel, {
    foreignKey: 'channelId'
  })
  public channel!: BelongsTo<typeof Channel>
}