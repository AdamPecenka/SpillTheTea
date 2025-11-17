import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ChannelMember extends BaseModel {
  @column()
  declare channelId: number

  @column()
  declare userId: number
  
  @column()
  declare isAdmin: boolean

  @column()
  declare isPinned: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}