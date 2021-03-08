'use strict'
const BaseCommand = require('../base')

class RawPanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'rawpanel',
      aliases: ['rawpnl'],
      description: 'Posts the raw content of a panel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'idOrName',
        prompt: 'What panel would you like to know the raw content of?',
        type: 'integer|string'
      }]
    })
  }

  run (message, { idOrName }) {
    const panel = message.guild.panels.resolve(idOrName)
    if (!panel) {
      return message.reply('Panel not found.')
    }

    return message.reply(panel.content, { allowedMentions: { users: [message.author.id] } })
  }
}

module.exports = RawPanelCommand