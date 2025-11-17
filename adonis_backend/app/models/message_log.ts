import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import Channel from './channel.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class MessageLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare senderId: number
  
  @column()
  declare channelId: number

  @column()
  declare messageText: string

  @column()
  declare sentTimestamp: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
      foreignKey: 'sender_id',
    })
    public channelMember!: BelongsTo<typeof User>
  
    @belongsTo(() => Channel, {
      foreignKey: 'channel_id'
    })
    public channel!: BelongsTo<typeof Channel>
}