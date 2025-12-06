import { io, Socket } from 'socket.io-client';
import { useChannelStore } from 'src/store/channelStore';

class WebSocketService {
    private socket: Socket

    constructor() {
        this.socket = io('http://localhost:3333', {
            autoConnect: false,
            auth: {
                token: null,
                userId: null
            }
        })
    }

    init(userId: number, token: string) {
        this.socket.auth = { token, userId }
        this.socket.connect()
        this.defineListeners()
    }

    destroy() {
        this.socket.auth = { token: null, userId: null }
        this.socket.disconnect()
    }

    defineListeners(){
        // sem davat pocuvajuce socket veci

        this.socket.on('Channel:UpdatePinState', ({channelId, pinState}) => {
            console.log(`[~] Channel pin state updated: ${channelId} -> ${pinState}`)
            useChannelStore().updatePinnedState(channelId, pinState)
        })

        this.socket.on('Channel:NewChannel', (channel) => {
            useChannelStore().addNewChannel(channel)
        })
    }

    // sem definovat funkcie na emitovanie socket veci

    pinChannel(channelId: number, pinState: boolean) {
        this.socket.emit('Channel:SetPin', {channelId: channelId, pinState: pinState})
    }

    createChannel(data: { name: string, isPrivate?: boolean, description?: string }) {
        this.socket.emit('Channel:Create', data)
    }
}

export const wsService = new WebSocketService();