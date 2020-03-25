'use strict'
require('dotenv').config()

const Command = require('../../controllers/command')

module.exports = class MaliciousSpreadsheetsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'maliciousspreadsheets',
            details: 'This command can only be run in the #hr channel.',
            aliases: ['ms'],
            description: 'Posts a link of the Malicious Spreadsheets.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    hasPermission (message) {
        const guild = this.client.bot.getGuild(message.guild.id)
        return message.channel.id === guild.getData('channels').hrChannel ? super.hasPermission(message) : 'Wrong ' +
            'channel.'
    }

    execute (message) {
        message.reply(`<${process.env.MS_DOC}>`)
    }
}