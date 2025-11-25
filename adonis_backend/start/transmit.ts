import transmit from '@adonisjs/transmit/services/main'

console.log('🔌 Transmit authorization loaded')

/**
 * DOČASNE BEZ AUTENTIFIKÁCIE
 * TODO: Pridať auth kontrolu neskôr
 */
transmit.authorize('channels', () => {
  return true
})

transmit.authorize('channels/:id', () => {
  return true
})