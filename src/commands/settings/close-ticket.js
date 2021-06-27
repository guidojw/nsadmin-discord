'use strict'

const BaseCommand = require('../base')

const { stripIndents } = require('common-tags')
const { discordService } = require('../../services')

class CloseTicketCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'closeticket',
      aliases: ['close'],
      description: 'Closes this ticket.',
      clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES', 'MANAGE_CHANNELS'],
      guarded: true,
      hidden: true
    })
  }

  async run (message) {
    const ticket = message.guild.tickets.resolve(message.channel)
    if (ticket) {
      const prompt = await message.channel.send('Are you sure you want to close this ticket?')
      const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅', '🚫']) === '✅'

      if (choice) {
        message.guild.log(
          message.author,
          stripIndents`
          ${message.author} **closed ticket** \`${ticket.id}\`
          ${message.content}
          `,
          { footer: `Ticket ID: ${ticket.id}` }
        )

        if (message.member.id === ticket.author.id) {
          ticket.close('Ticket successfully closed.', false, message.guild.primaryColor)
        } else {
          ticket.close('The moderator has closed your ticket.', true, message.guild.primaryColor)
        }
      }
    }
  }
}

module.exports = CloseTicketCommand
