import { BaseSchema } from '@adonisjs/lucid/schema'
import { UserStatus } from '../../app/enums/UserStatusEnum.js'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.raw(`
      CREATE TYPE user_status AS ENUM ('online', 'away', 'dnd', 'offline');
    `);

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary().notNullable()

      table.string('username', 50).notNullable().unique()
      table.string('firstname', 50).notNullable()
      table.string('lastname', 50).notNullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.specificType('status', 'user_status').notNullable().defaultTo(UserStatus.ONLINE)
      table.boolean('mentioned_notify').notNullable().defaultTo(true)
      table.string('avatar_url', 50).notNullable().defaultTo('/src/assets/avatars/avatar1.png')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable() 
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw(`DROP TYPE IF EXISTS user_status;`);
  }
}
