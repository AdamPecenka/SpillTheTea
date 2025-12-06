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

  @column({ columnName: 'is_private' })
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
    pivotColumns: ['is_admin', 'is_pinned'],
  })
  public members!: ManyToMany<typeof User>

  @hasMany(() => MessageLog, {
    foreignKey: 'channelId'
  })
  public messages!: HasMany<typeof MessageLog>

  @hasMany(() => ChannelBannedMember, {
    foreignKey: 'channelId'
  })
  public bannedMembers!: HasMany<typeof ChannelBannedMember>
  
  @hasMany(() => ChannelInvite, {
    foreignKey: 'channelId'
  })
  public invites!: HasMany<typeof ChannelInvite>
}