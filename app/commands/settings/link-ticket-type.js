'use strict'
const BaseCommand = require('../base')

class LinkTicketTypeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'linktickettype',
      aliases: ['linktt'],
      description: 'Links a message reaction to a ticket type.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to link?',
        type: 'integer|string'
      }, {
        key: 'emoji',
        prompt: 'What emoji would you like to link to this ticket type?',
        type: 'custom-emoji|default-emoji'
      }, {
        key: 'message',
        prompt: 'On what message would you like this emoji to be reacted?',
        type: 'string',
        validate: validateMessage
      }, {
        key: 'channel',
        prompt: 'In what channel is this message?',
        type: 'text-channel'
      }]
    })
  }

  async run (message, { type, emoji, message: bindMessage, channel }) {
    type = await message.guild.ticketTypes.link(type, emoji, bindMessage, channel)

    return message.reply(`Successfully linked emoji ${type.emoji} on message **${type.messageId}** to ticket type **${type.name}**.`)
  }
}

function validateMessage (val, msg) {
  const valid = this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  return /^[0-9]+$/.test(val) || 'Message must be a snowflake ID.'
}

module.exports = LinkTicketTypeCommand