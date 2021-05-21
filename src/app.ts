import * as Sentry from '@sentry/node'
import AroraClient from './client/client'
import cron from 'node-cron'
import cronConfig from './configs/cron'
import dotenv from 'dotenv'

dotenv.config()

if (typeof process.env.SENTRY_DSN !== 'undefined') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.BUILD_HASH
  })
}

cron.schedule(
  cronConfig.healthCheckJobConfig.expression,
  cronConfig.healthCheckJobConfig.job.bind(cronConfig.healthCheckJobConfig.job, 'main')
)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
new AroraClient({
  commandEditableDuration: 0
}).login(process.env.DISCORD_TOKEN)
