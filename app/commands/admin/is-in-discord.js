'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class IsInDiscordCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'isindiscord',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Checks if given username is in the Discord server.',
            examples: ['isindiscord Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to check is the Discord server?',
                    type: 'string'
                }
            ]
        })
    }

    async execute (message, { username }, guild) {
        const member = await discordService.getMemberByName(guild.guild, username)
        if (member) {
            message.reply( `Yes, **${member.displayName}** is in this server.`)
        } else {
            message.reply(`No, **${username}** is not in this server.`)
        }
    }
}