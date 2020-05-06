'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const userService = require('../../services/user')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

module.exports = class RoleCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'role',
            aliases: ['getrole'],
            description: 'Posts the group role of given user/you.',
            examples: ['role', 'role Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'member|string',
                    prompt: 'Of which user would you like to know the group role?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username ? typeof user === 'string' ? username : username.displayName : message.member.displayName
        const userId = await userService.getIdFromUsername(username)
        const role = (await applicationAdapter('get', `/v1/users/${userId}/role/${
            applicationConfig.groupId}`)).data
        const embed = new MessageEmbed()
            .addField(`${message.argString ? username + '\'s' : 'Your'} role`, role)
            .setColor(applicationConfig.primaryColor)
        message.replyEmbed(embed)
    }
}
