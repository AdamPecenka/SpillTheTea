import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ChannelMember extends BaseModel {
  @column({ columnName: 'channel_id' })
  declare channelId: number

  @column({ columnName: 'user_id' })
  declare userId: number
  
  @column({ columnName: 'is_admin' })
  declare isAdmin: boolean

  @column({ columnName: 'is_pinned' })
  declare isPinned: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}