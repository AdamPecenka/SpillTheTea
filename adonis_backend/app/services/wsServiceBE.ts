import { Server } from "socket.io";
import server from "@adonisjs/core/services/server";
import { Secret } from "@adonisjs/core/helpers";
import User from "#models/user";
import ChannelsController from "#controllers/channels_controller";
import MessagesController from "#controllers/messages_controller";

class WsServiceBE {
    io: Server | undefined
    
    onBoot() {
        const channelsController = new ChannelsController();
        const meessagesController = new MessagesController();

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
                const channel = await channelsController.createChannel(USER_ID, data)
                socket.join(`Channel:${channel.id}`)
                this.io?.to(`User:${USER_ID}`).emit('Channel:NewChannel', channel)
            })

            socket.on('Message:Send', async (data) => { 
                const message = await meessagesController.sendMessage(data)
                this.io?.to(`Channel:${data.channelId}`).emit('Message:Receive', message)
            })




            console.log(socket.rooms)

            socket.on("disconnect", () => {
                console.log(`\n[-] User disconnected: ${socket.id}\n`);
            });
        });
    }
}

export default new WsServiceBE();