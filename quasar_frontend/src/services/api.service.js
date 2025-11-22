// src/services/api.service.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3333/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ===== CHANNELS ONLY =====

export async function getChannels() {
  const response = await api.get('/channels')
  return response.data
}

export async function getChannel(channelId) {
  const response = await api.get(`/channels/${channelId}`)
  return response.data
}

export async function createChannel(data) {
  const response = await api.post('/channels', data)
  return response.data
}

export async function updateChannel(channelId, data) {
  const response = await api.put(`/channels/${channelId}`, data)
  return response.data
}

export async function deleteChannel(channelId) {
  await api.delete(`/channels/${channelId}`)
}

export default api