'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')

const applicationConfig = require('../../../config/application')

module.exports = class DemoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'demote',
            description: 'Demotes given user in the group.',
            examples: ['demote Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to demote?',
                    type: 'member|string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username ? typeof username === 'string' ? username : username.displayName : message.member
            .displayName
        const [userId, authorId] = await Promise.all([userService.getIdFromUsername(username), userService
            .getIdFromUsername(message.member.displayName)])
        const rank = await userService.getRank(userId, applicationConfig.groupId)
        const roles = (await applicationAdapter('put', `/v1/groups/${applicationConfig.groupId}/` +
            `users/${userId}`, { authorId, rank: rank > 100 && rank <= 102 ? rank - 1 : rank === 100 ? 5 : rank >
            3 && rank <= 5 ? rank - 1 : rank === 3 ? 1 : 0 })).data
        message.reply(`Successfully demoted **${username}** from **${roles.oldRole.name}** to **${roles.newRole.name}` +
            '**.')
    }
}