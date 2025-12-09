import * as schedulerService from '#services/schedulerService'

const schedulerInstance = new schedulerService.SchedulerService()

schedulerInstance.addJob({ 
    key: 'ChannelCleanupJob',
    job: new schedulerService.ChannelCleanupJob(),
    cronExp: '* * * * *'
})

schedulerInstance.scheduleAllJobs()