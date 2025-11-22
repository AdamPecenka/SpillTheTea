import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { UserStatus } from '../enums/UserStatusEnum.js'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Channel from './channel.js'
import MessageLog from './message_log.js'
import ChannelBannedMember from './channel_banned_member.js'
import ChannelInvite from './channel_invite.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username', 'email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare firstname: string

  @column()
  declare lastname: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare status: UserStatus

  @column()
  declare mentionedNotify: boolean

  @column()
  declare avatarUrl: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @manyToMany(() => Channel, {
    pivotTable: 'channel_members',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'channel_id',
    pivotTimestamps: true,
  })
  public channels!: ManyToMany<typeof Channel>
  
  @hasMany(() => MessageLog, {
    foreignKey: 'sender_id'
  })
  public sentMessages!: HasMany<typeof MessageLog>
  
  @hasMany(() => ChannelBannedMember, {
    foreignKey: 'user_id'
  })
  public bans!: HasMany<typeof ChannelBannedMember>
  
  @hasMany(() => ChannelInvite, {
    foreignKey: 'user_id'
  })
  public invites!: HasMany<typeof ChannelInvite>
  
  static accessTokens = DbAccessTokensProvider.forModel(User, {expiresIn: '7 days'})
}