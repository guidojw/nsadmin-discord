'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { discordService } = require('../../services')

class PanelsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'nsadmingroups',
      description: 'Lists all role and channel groups.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'group',
        prompt: 'What group would you like to know the information of?',
        type: 'integer|string',
        default: ''
      }]
    })
  }

  async run (message, { group }) {
    if (group) {
      group = message.guild.groups.resolve(group)
      if (!group) {
        return message.reply('Group not found.')
      }

      const embed = new MessageEmbed()
        .setTitle(`Group ${group.id}`)
        .addField('Name', group.name, true)
        .addField('Type', group.type, true)
        .addField('Guarded', group.guarded ? 'yes' : 'no', true)
        .setColor(message.guild.primaryColor)
      if (group.type === 'channel') {
        embed.addField('Channels', group.channels.cache
          .map(channel => `<#${channel.id}>`)
          .join(' ') || 'none'
        )
      } else {
        embed.addField('Roles', group.roles.cache
          .map(role => `<@${role.id}>`)
          .join(' ') || 'none'
        )
      }
      return message.replyEmbed(embed)
    } else {
      if (message.guild.groups.cache.size === 0) {
        return message.reply('No groups found.')
      }

      const embeds = discordService.getListEmbeds(
        'Groups',
        message.guild.groups.cache,
        getGroupRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getGroupRow ([, group]) {
  return `${group.id}. **${group.name}**`
}

module.exports = PanelsCommand
