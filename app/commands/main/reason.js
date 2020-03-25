'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')
const discordService = require('../../services/discord')
const pluralize = require('pluralize')
const { MessageEmbed } = require('discord.js')
const timeHelper = require('../../helpers/time')

module.exports = class ReasonCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'reason',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['suspendinfo'],
            description: 'Posts the reason why given username/you is suspended.',
            examples: ['reason', 'reason Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of who would you like to know the suspend reason?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }, guild) {
        if (username && !discordService.isAdmin(message.member, guild.getData('adminRoles'))) {
            return message.reply('Insufficient powers!')
        }
        username = username || message.member.displayName
        try {
            const userId = await userService.getIdFromUsername(username)
            const suspension = (await applicationAdapter('get', `/v1/groups/${applicationConfig
                .groupId}/suspensions/${userId}`)).data
            if (suspension) {
                const days = suspension.duration / 86400
                const embed = new MessageEmbed()
                    .setTitle(`${message.argString ? `${username}'s` : 'Your'} suspension`)
                    .addField('Start date', timeHelper.getDate(suspension.at * 1000), true)
                    .addField('Start time', timeHelper.getTime(suspension.at * 1000), true)
                    .addField('Duration', `${days} ${pluralize('day', days)}`, true)
                    .addField('Rank back', suspension.rankback ? 'yes' : 'no', true)
                    .addField('Reason', suspension.reason)
                message.replyEmbed(embed)
            } else {
                message.reply('Couldn\'t find suspension!')
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}