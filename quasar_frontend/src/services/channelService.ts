import { api } from 'boot/axios'

export const channelService = { 
    async getChannels(){
        const response = await api.get('/api/channels')
        return response.data
    },
    async getInvites() {
        const response = await api.get('/api/channels/invites')
        return response.data
    }
}