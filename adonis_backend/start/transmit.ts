import transmit from '@adonisjs/transmit/services/main'

/**
 * Registrácia WebSocket channels pre Transmit v2
 * DOČASNE BEZ AUTENTIFIKÁCIE
 */

transmit.authorize('channels', () => {
  return true
})