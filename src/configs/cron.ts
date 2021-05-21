import { BaseJob, announceTrainingsJob, healthCheckJob, premiumMembersReportJob } from '../jobs'

export interface CronConfig { expression: string, job: BaseJob }

const cronConfig: { [key: string]: CronConfig } = {
  announceTrainingsJob: {
    expression: '*/5 * * * *', // https://crontab.guru/#*/5_*_*_*_*
    job: announceTrainingsJob
  },
  healthCheckJob: {
    expression: '*/5 * * * *', // https://crontab.guru/#*/5_*_*_*_*
    job: healthCheckJob
  },
  premiumMembersReportJob: {
    expression: '0 12 */1 * *', // https://crontab.guru/#0_12_*/1_*_*
    job: premiumMembersReportJob
  }
}

export default cronConfig
