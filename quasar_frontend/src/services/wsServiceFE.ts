import { data } from 'autoprefixer';
import { io, Socket } from 'socket.io-client';
import { useChannelStore } from 'src/store/channelStore';
import { messageService } from './messageService';
import { useMessageStore } from 'src/store/messageStore';
import { notificationService } from './notificationService';

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

        this.socket.on('Channel:Remove', ({channelId}) => {
            useChannelStore().removeChannel(channelId)
        })

        this.socket.on('Channel:UserLeft', ({userId}) => {
            useChannelStore().removeMemberFromActiveChannel(userId)
        })

        this.socket.on('Channel:NewMember', ({channelId, member}) => {
            useChannelStore().updateMemberList(channelId, member)
        })

        this.socket.on('Typing:Broadcast', ({ channelId, username, messageText }) => {
            if(useChannelStore().activeChannelId !== channelId) return
            useMessageStore().addTypingUser(username, messageText)
        })

        this.socket.on('Error:Message', ({ message }) => {
            notificationService.displayError(message)
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

    leaveChannel(channelId: number) {
        this.socket.emit('Channel:Leave', { channelId })
    }

    deleteChannel(channelId: number) {
        this.socket.emit('Channel:Delete', { channelId })
    }

    joinChannel(channelName: string, isPrivate: boolean) { 
        this.socket.emit('Channel:Join', { channelName, isPrivate })
    }

    typeMessage(channelId: number, username: string, messageText: string) { 
        this.socket.emit('Typing:Emit', { channelId, username, messageText })
    }
}

export const wsService = new WebSocketService();