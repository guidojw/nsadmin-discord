'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const discordService = require('../../services/discord')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')
const timeHelper = require('../../helpers/time')
const { MessageEmbed } = require('discord.js')
const pluralize = require('pluralize')

module.exports = class SuspensionsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'suspensions',
            aliases: ['suspensionlist', 'suspensioninfo', 'suspension'],
            description: 'Lists info of current suspensions/given username\'s suspension. Only admins can see the ' +
                'suspensions of others.',
            details: 'Username must be a username that is being used on Roblox.',
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of whose suspension would you like to know the information?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }, guild) {
        if (!discordService.isAdmin(message.member, guild.getData('adminRoles'))) {
            if (!username) {
                username = message.member.displayName
            } else {
                return message.reply('You do not have permission to use the `suspensions` command.')
            }
        }

        try {
            if (username) {
                const userId = await userService.getIdFromUsername(username)
                const suspension = (await applicationAdapter('get', `/v1/groups/${applicationConfig
                    .groupId}/suspensions/${userId}`)).data
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
                const suspensions = (await applicationAdapter('get', `/v1/groups/${applicationConfig
                    .groupId}/suspensions`)).data
                if (suspensions.length === 0) return message.reply('There are currently no suspensions.')
                const embeds = await discordService.getSuspensionEmbeds(suspensions)
                for (const embed of embeds) {
                    await message.author.send(embed)
                }
                message.reply('Sent you a DM with the current suspensions.')
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}