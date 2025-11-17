import { configApp } from '@adonisjs/eslint-config'

export default configApp({
    rules: {
        'unicorn/filename-case': 'camelCase',
        'comma-dangle': 'off',
    },
})