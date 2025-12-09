import { CronJob } from "cron";
import WsServiceBE from "./wsServiceBE.js";
import Channel from "#models/channel";
import db from "@adonisjs/lucid/services/db";


export interface JobConfig {
    key: string,
    job: Job,
    cronExp: string
}

export abstract class Job {
    abstract run(): any
}

export class SchedulerService { 
    private jobs: JobConfig[] = [];

    addJob(jobConfig: JobConfig) {
        this.jobs.push(jobConfig)
    }

    scheduleSingleJob(jobConfig: JobConfig) {
        const cronJob = new CronJob(jobConfig.cronExp, async () => {
            try {
                await jobConfig.job.run()
            } catch (e) {
                console.log(`[!] Error during job: ${jobConfig.key}`)
                console.error(e)
            }
        })

        cronJob.start()
    }

    scheduleAllJobs() {
        this.jobs.forEach((jobConfig) => {
            this.scheduleSingleJob(jobConfig)
            console.log(`[i] Job scheduled: ${jobConfig.key}`)
        })
    }
}

export class ChannelCleanupJob extends Job { 
    async run() { 
        try {
            const target = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            // const target = new Date(Date.now() - 3 * 60 * 1000) // 3 minutes for testing

            const allChannels = await Channel.all()

            for (const channel of allChannels) { 
                const newsetMessage = await db
                    .from('message_logs')
                    .where('channel_id', channel.id)
                    .max('sent_timestamp as lastMessageAt')
                    .first();

                const lastMessageAt = newsetMessage?.lastMessageAt
                    ? new Date(newsetMessage.lastMessageAt)
                    : null;

                if (lastMessageAt && lastMessageAt >= target) continue

                WsServiceBE.channelCleanUp(channel.id)

                console.log('[-] Deleting channel:', channel.name)
                await channel.delete()
            }
        } catch(e){
            console.log('[!] Error during ChannelCleanupJob')
            console.error(e)
        }
    }
}