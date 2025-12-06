import { api } from 'boot/axios'

export async function getChannels() {
  const response = await api.get('/api/channels')
  return response.data
}

export async function createChannel(data) {
  const response = await api.post('/api/channels', data)
  return response.data
}

export async function updateChannel(channelId, data) {
  const response = await api.put(`/api/channels/${channelId}`, data)
  return response.data
}

export async function updateChannelMember(channelId, userId, data) {
  const response = await api.put(`/api/channels/${channelId}/members/${userId}`, data)
  return response.data
}

export async function deleteChannel(channelId) {
  await api.delete(`/api/channels/${channelId}`)
}


export default api