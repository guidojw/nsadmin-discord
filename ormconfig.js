'use strict'

require('dotenv').config()
require('pg').defaults.parseInt8 = true // By default PG returns bigint columns as strings.

const baseConfig = {
  type: 'postgres',
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  entities: [
    'dist/entities/**/*.js'
  ],
  migrations: [
    'dist/migrations/**/*.js'
  ],
  subscribers: [
    'dist/subscribers/**/*.js'
  ],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
    subscribersDir: 'src/subscribers'
  }
}

module.exports = {
  development: {
    ...baseConfig,
    host: '127.0.0.1',
    database: 'arora_discord_development',
    logging: true
  },
  production: {
    ...baseConfig,
    host: process.env.POSTGRES_HOST,
    database: 'arora_discord_production'
  },
  staging: {
    ...baseConfig,
    host: process.env.POSTGRES_HOST,
    database: 'arora_discord_staging'
  }
}[process.env.NODE_ENV ?? 'development']
