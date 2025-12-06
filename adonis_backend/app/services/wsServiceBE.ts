import { Server } from "socket.io";
import server from "@adonisjs/core/services/server";
import { Secret } from "@adonisjs/core/helpers";
import User from "#models/user";
import ChannelsController from "#controllers/channels_controller";

class WsServiceBE {
    io: Server | undefined
    
    onBoot() {
        const channelsController = new ChannelsController();

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




        this.io.on("connection", (socket) => {
            const USER_ID: number = socket.data.userId

            console.log("[+] User connected:", socket.id)

            // JOINING SOCKET ROOMS
            // user roomka aby sme vedeli robit real time updates pre konkretneho usera na vsetkych instanciach appky
            socket.join(`User:${USER_ID}`)

            socket.on('Channel:JoinRoom', (channelId) => {
                console.log(`[+] User ${USER_ID} joined channel socket room: ${channelId}`)
                socket.join(`Channel:${channelId}`)
            })

            // SOCKET "ROUTES"
            socket.on('Channel:SetPin', ({ channelId, pinState }) => {
                channelsController.updatePinForChannel(USER_ID, channelId, pinState)
                socket.to(`User:${USER_ID}`).emit('Channel:UpdatePinState', { channelId: channelId, pinState: pinState })
            })

            socket.on('Channel:Create', async (data) => {
                const channel = await channelsController.createChannel(USER_ID, data)
                this.io?.to(`User:${USER_ID}`).emit('Channel:NewChannel', channel)
            })






            socket.on("disconnect", () => {
                console.log("[-] User disconnected:", socket.id);
            });
        });
    }
}

export default new WsServiceBE();