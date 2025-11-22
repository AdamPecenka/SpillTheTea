import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
    public async login({ request, response }: HttpContext) {
        const { username, password } = request.only(['username', 'password'])

        const user = await User.findByOrFail('username', username)

        if (!(await hash.verify(user.password, password))) {
            return response.unauthorized('Invalid credentials')
        }

        const token = await User.accessTokens.create(user)

        return response.ok({
            token: token.value!.release(),
            user: user,
        })
    }

    public async register({ request, response }: HttpContext) {
        const data = request.only(['firstname', 'lastname', 'username', 'email', 'password'])

        const existsUsername = await User.findBy('username', data.username)
        const existsEmail = await User.findBy('email', data.email)
        
        if (existsUsername) {
            return response.badRequest({
                error: 'USERNAME_TAKEN',
                message: 'This username is already in use',
            })
        }
        
        if (existsEmail) {
            return response.badRequest({
                error: 'EMAIL_TAKEN',
                message: 'This email is already registered',
            })
        }

        const user = await User.create({
            firstname: data.firstname,
            lastname: data.lastname,
            username: data.username,
            email: data.email,
            password: data.password
        })

        const token = await User.accessTokens.create(user)

        return response.ok({
            token: token.value!.release(),
            user: user,
        })
    }
}