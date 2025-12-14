import { Server } from "socket.io";
import server from "@adonisjs/core/services/server";
import { Secret } from "@adonisjs/core/helpers";
import User from "#models/user";
import ChannelsController from "#controllers/channels_controller";
import MessagesController from "#controllers/messages_controller";
import UsersController from "#controllers/users_controller";

class WsServiceBE {
    io: Server | undefined
    
    onBoot() {
        const channelsController = new ChannelsController();
        const meessagesController = new MessagesController();
        const usersController = new UsersController();

        this.io = new Server(server.getNodeServer(), {
            cors: {
                origin: "*"
            }
        });

        // little auth middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth?.token
                if (!token) {
                    return next(new Error("Unauthorized"))
                }

                const secret = new Secret(token)
                const tokenRecord = await User.accessTokens.verify(secret)

                if (!tokenRecord) {
                    return next(new Error("Unauthorized"))
                }

                socket.data.userId = tokenRecord.tokenableId
                next()
            } catch (err) {
                next(new Error("Unauthorized"))
            }
        });




        this.io.on("connection", async (socket) => {
            console.log("[+] User connected:", socket.id)
            
            const USER_ID: number = socket.data.userId
            const channelIds = await channelsController.getChannelIdsForUser(USER_ID)

            // JOINING SOCKET ROOMS
            socket.join(`User:${USER_ID}`)
            
            for (const cId of channelIds) {
                socket.join(`Channel:${cId}`)
                console.log(`[+] User ${USER_ID} joined Channel room: Channel:${cId}`)
            }
            

            // SOCKET "ROUTES"
            socket.on('Channel:SetPin', async ({ channelId, pinState }) => {
                await channelsController.updatePinForChannel(USER_ID, channelId, pinState)
                socket.to(`User:${USER_ID}`).emit('Channel:UpdatePinState', { channelId: channelId, pinState: pinState })
            })

            socket.on('Channel:Create', async (data) => {
                const channelResult = await channelsController.createChannel(USER_ID, data)

                if(channelResult.ok === false){ 
                    socket.emit('Error:Message', {  message: channelResult.message })
                    return
                }

                socket.join(`Channel:${channelResult.channel.id}`)
                this.io?.to(`User:${USER_ID}`).emit('Channel:NewChannel', channelResult.channel)
            })

            socket.on('Message:Send', async (data) => { 
                const message = await meessagesController.sendMessage(data)
                this.io?.to(`Channel:${data.channelId}`).emit('Message:Receive', message)
            })

            socket.on('Channel:Leave', async ({ channelId }) => {
                await channelsController.removeUserFromChannel(USER_ID, channelId)
                socket.to(`User:${USER_ID}`).emit('Channel:Remove', { channelId: channelId })
                socket.to(`Channel:${channelId}`).emit('Channel:RemoveMember', {userId: USER_ID })
                socket.leave(`Channel:${channelId}`)    
            })

            socket.on('Channel:Delete', async ({ channelId }) => {
                await channelsController.deleteChannel(channelId)
                socket.to(`Channel:${channelId}`).emit('Channel:Remove', { channelId: channelId })
                socket.leave(`Channel:${channelId}`)
            })

            socket.on('Channel:Join', async ({channelName, isPrivate}) => {
                const channelResult = await channelsController.joinChannel(USER_ID, channelName, isPrivate)
                
                if (channelResult.ok === false){
                    socket.emit('Error:Message', { message: channelResult.message })
                    return
                }

                socket.join(`Channel:${channelResult.channel.id}`)

                this.io?.to(`User:${USER_ID}`).emit('Channel:NewChannel', channelResult.channel)
                
                if(channelResult.createdNewChannel === false){
                    socket.to(`Channel:${channelResult.channel.id}`).emit('Channel:NewMember', { channelId: channelResult.channel.id, member: channelResult.member})
                }
            })

            socket.on('Typing:Emit', ({ channelId, username, messageText }) => {
                socket.to(`Channel:${channelId}`).emit('Typing:Broadcast', { channelId, username, messageText })
            })

            socket.on('User:ChangeMentions', async ({ newValue }) => {
                await usersController.updateMentionSettingForUser(USER_ID, newValue)
                socket.to(`User:${USER_ID}`).emit('User:UpdateMentions', { newValue })
            })

            socket.on('Channel:Invite', async ({channelId, username}) => {
                const invitedChannel = await channelsController.inviteUser(channelId, username, USER_ID)

                if(invitedChannel?.ok === false){
                    socket.emit('Error:Message', { message: invitedChannel.message })
                    return
                }
                
                this.io?.to(`User:${invitedChannel.targetUserId}`).emit('Channel:NewChannel', invitedChannel.channel)
            })

            socket.on('Channel:AcceptInvite', async ({channelId}) => {
                const res = await channelsController.acceptInvite(channelId, USER_ID)

                this.io?.in(`User:${USER_ID}`).socketsJoin(`Channel:${channelId}`)

                socket.to(`User:${USER_ID}`).emit('Channel:InviteAccepted', { channelId: channelId })
                socket.to(`Channel:${channelId}`).emit('Channel:NewMember', { channelId: channelId, member: res})
            })

            socket.on('Channel:RejectInvite', async ({channelId}) => {
                await channelsController.rejectInvite(channelId, USER_ID)
                socket.to(`User:${USER_ID}`).emit('Channel:Remove', { channelId: channelId })
            })

            socket.on('Channel:RevokeMember', async ({channelId, username}) => {
                const res = await channelsController.revokeMember(channelId, username)
                if(res.ok === false){
                    socket.emit('Error:Message', { message: res.message })
                    return
                }

                this.io?.to(`Channel:${channelId}`).emit('Channel:RemoveMember', {userId: res.userId})
                this.io?.to(`User:${res.userId}`).emit('Channel:Remove', { channelId: channelId })

                this.io?.in(`User:${res.userId}`).socketsLeave(`Channel:${channelId}`)
            })

            socket.on('Channel:Kick', async ({channelId, targetName, adminKick}) => {
                const res = await channelsController.kickMember(channelId, USER_ID, targetName, adminKick)

                if(res.ok === false) {
                    socket.emit('Error:Message', {message: res.message })
                }

                this.io?.to(`Channel:${channelId}`).emit('Channel:RemoveMember', { userId: res.targetUserId })
                this.io?.to(`User:${res.targetUserId}`).emit('Channel:Remove', { channelId: channelId })

                this.io?.in(`User:${res.targetUserId}`).socketsLeave(`Channel:${channelId}`)
            })







            console.log(socket.rooms)

            socket.on("disconnect", () => {
                console.log(`\n[-] User disconnected: ${socket.id}\n`);
            });
        });
    }

    channelCleanUp(channelId: number) {
        this.io?.to(`Channel:${channelId}`).emit('Channel:Remove', { channelId })
        this.io?.in(`Channel:${channelId}`).socketsLeave(`Channel:${channelId}`);
    }
}

export default new WsServiceBE();