import { data } from 'autoprefixer';
import { io, Socket } from 'socket.io-client';
import { useChannelStore } from 'src/store/channelStore';
import { messageService } from './messageService';

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
            useChannelStore().updatePinnedState(channelId, pinState)
        })

        this.socket.on('Channel:NewChannel', (channel) => {
            useChannelStore().addNewChannel(channel)
        })

        this.socket.on('Message:Receive', (message) => {
            messageService.handleIncomingMessage(message)
        })
    }

    // sem definovat funkcie na emitovanie socket veci

    pinChannel(channelId: number, pinState: boolean) {
        this.socket.emit('Channel:SetPin', {channelId: channelId, pinState: pinState})
    }

    createChannel(channel: { name: string, isPrivate?: boolean, description?: string }) {
        this.socket.emit('Channel:Create', channel)
    }

    sendMessage(message: { channelId: number, senderId: number, messageText: string }) {
        this.socket.emit('Message:Send', message)
    }
}

export const wsService = new WebSocketService();