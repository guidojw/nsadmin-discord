'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const discordService = require('../../services/discord')
const userService = require('../../services/user')
const applicationConfig = require('../../../config/application')

module.exports = class UpdateCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'update',
            details: 'Username must be a existing nickname in the Discord guild.',
            description: 'Updates the roles of given nickname/you.',
            examples: ['update', 'update @Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'MANAGE_ROLES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'member',
                    prompt: 'Whose roles would you like to update?',
                    type: 'member',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { member }, guild) {
        if (member && !discordService.isAdmin(message.member, guild.getData('adminRoles'))) {
            return message.reply('Insufficient powers!')
        }
        member = member || message.member
        const username = member.nickname || member.user.username
        try {
            const userId = await userService.getIdFromUsername(username)
            const rank = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/` +
                `rank/${userId}`)).data
            await discordService.updateRoles(guild.guild, member, rank)
            message.reply(`Successfully checked ${message.argString ? '**' + username + '**\'s' : 'your'} roles.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}