import User from "#models/user";
// import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
    public async updateMentionSettingForUser(userId: number, newValue: boolean) {
        const user = await User.query()
            .where('id', userId)
            .first()

        if(!user) return

        user.mentionedNotify = newValue
        user.save()
    }
}