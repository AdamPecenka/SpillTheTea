import User from "#models/user";
import { UserStatus } from "../enums/UserStatusEnum.js";
// import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
    async updateMentionSettingForUser(userId: number, newValue: boolean) {
        const user = await User.query()
            .where('id', userId)
            .first()

        if(!user) return

        user.mentionedNotify = newValue
        user.save()
    }

    async setStatus(userId: number, newStatus: string) {
        const user = await User.findBy('id', userId)

        if(!user) return

        switch(newStatus){
            case 'online':
                user.status = UserStatus.ONLINE
                break
            case 'offline':
                user.status = UserStatus.OFFLINE
                break
            case 'dnd':
                user.status = UserStatus.DND
                break
            case 'away':
                user.status = UserStatus.AWAY
                break
        }

        user.save()
    }
}