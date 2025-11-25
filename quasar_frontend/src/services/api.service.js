// src/services/api.service.js
// ✅ Používame Adamov axios instance, ktorý už má auth token!
import { api } from 'boot/axios'

// ============================================
// CHANNELS
// ============================================

/**
 * Get all channels
 */
export async function getChannels() {
  const response = await api.get('/api/channels')
  return response.data
}

/**
 * Create new channel
 */
export async function createChannel(data) {
  const response = await api.post('/api/channels', data)
  return response.data
}

/**
 * Update channel info (name, description, isPrivate)
 */
export async function updateChannel(channelId, data) {
  const response = await api.put(`/api/channels/${channelId}`, data)
  return response.data
}

/**
 * 🆕 Update channel member settings (isPinned, isAdmin)
 * This is what we need for toggling pin!
 */
export async function updateChannelMember(channelId, userId, data) {
  const response = await api.put(`/api/channels/${channelId}/members/${userId}`, data)
  return response.data
}

/**
 * Delete channel
 */
export async function deleteChannel(channelId) {
  await api.delete(`/api/channels/${channelId}`)
}

// ============================================
// MESSAGES
// ============================================

/**
 * Get messages for a channel
 */
export async function getMessages(channelId) {
  const response = await api.get(`/api/channels/${channelId}/messages`)
  return response
}

/**
 * Send message to channel
 */
export async function sendMessage(channelId, messageText) {
  const response = await api.post(`/api/channels/${channelId}/messages`, {
    messageText
  })
  return response.data
}

/**
 * Send typing indicator
 */
export async function sendTyping(channelId, isTyping) {
  await api.post(`/api/channels/${channelId}/typing`, {
    isTyping
  })
}

export default api