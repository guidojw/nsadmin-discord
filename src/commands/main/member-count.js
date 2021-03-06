'use strict'

const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { groupService } = require('../../services')

class MemberCountCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'membercount',
      description: 'Posts the current member count of the group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'groupId',
          type: 'integer',
          prompt: 'From what group would you like to know the member count?',
          default: message => message.guild.robloxGroupId ?? undefined
        }
      ]
    })
  }

  async run (message, { groupId }) {
    if (typeof groupId === 'undefined') {
      return message.reply('Invalid group ID.')
    }
    const group = await groupService.getGroup(groupId)

    const embed = new MessageEmbed()
      .addField(`${group.name}'s member count`, group.memberCount)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = MemberCountCommand
