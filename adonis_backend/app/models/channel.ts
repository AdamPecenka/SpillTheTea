import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import MessageLog from './message_log.js'
import ChannelBannedMember from './channel_banned_member.js'
import ChannelInvite from './channel_invite.js'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare isPrivate: boolean

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'channel_members',
    pivotForeignKey: 'channel_id',
    pivotRelatedForeignKey: 'user_id',
    pivotTimestamps: true,
  })
  public users!: ManyToMany<typeof User>

  @hasMany(() => MessageLog, {
      foreignKey: 'channel_id'
  })
  public sentMessages!: HasMany<typeof MessageLog>

  @hasMany(() => ChannelBannedMember, {
      foreignKey: 'channel_id'
  })
  public bans!: HasMany<typeof ChannelBannedMember>
  
  @hasMany(() => ChannelInvite, {
    foreignKey: 'channel_id'
  })
  public invites!: HasMany<typeof ChannelInvite>
}