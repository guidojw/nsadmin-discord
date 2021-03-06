'use strict'

require('dotenv').config()

module.exports = {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: '127.0.0.1',
    database: 'arora_discord_development',

    dialect: 'postgres',
    operatorsAliases: '0',
    define: {
      timestamps: false,
      underscored: true
    },
    migrationStorageTableName: 'sequelize_meta'
  },

  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    database: 'arora_discord_production',

    dialect: 'postgres',
    operatorsAliases: '0',
    define: {
      timestamps: false,
      underscored: true
    },
    migrationStorageTableName: 'sequelize_meta',
    logging: false
  },

  staging: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    database: 'arora_discord_staging',

    dialect: 'postgres',
    operatorsAliases: '0',
    define: {
      timestamps: false,
      underscored: true
    },
    migrationStorageTableName: 'sequelize_meta',
    logging: false
  }
}
