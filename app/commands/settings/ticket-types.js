'use strict'
const BaseCommand = require('../base')
const discordService = require('../../services/discord')

const { MessageEmbed } = require('discord.js')
const { TicketType } = require('../../models')

class RoleBindingsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'tickettypes',
      description: 'Lists all ticket types.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'typeId',
        prompt: 'What ticket type ID would you like to know the information of?',
        type: 'integer',
        default: ''
      }]
    })
  }

  async run (message, { typeId }) {
    if (typeId) {
      const ticketType = await TicketType.findByPk(typeId)
      if (!ticketType) {
        return message.reply('Ticket type not found.')
      }

      const embed = new MessageEmbed()
        .addField(`Ticket Type ${ticketType.id}`, `**${ticketType.name}**`)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      const ticketTypes = await TicketType.findAll({ where: { guildId: message.guild.id } })
      if (ticketTypes.length === 0) {
        return message.reply('No ticket types found.')
      }

      const embeds = await discordService.getListEmbeds(
        'Ticket Types',
        ticketTypes,
        getTicketTypeRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getTicketTypeRow ([, ticketType]) {
  return `${ticketType.id}. **${ticketType.name}**\n`
}

module.exports = RoleBindingsCommand