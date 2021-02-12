'use strict'
const BaseCommand = require('../base')

const { Group } = require('../../models')

class DeleteGroupCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletegroup',
      aliases: ['delgroup'],
      description: 'Deletes a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'groupId',
        prompt: 'What group would you like to delete?',
        type: 'id',
        validate: validateName
      }]
    })
  }

  async run (message, { groupId }) {
    const group = await Group.findOne({ where: { id: groupId, guildId: message.guild.id } })
    if (!group) {
      return message.reply('Group not found.')
    }

    message.guild.groups.delete(group.id)
    await group.destroy()

    return message.reply(`Successfully deleted group **${group.name}**.`)
  }
}

function validateName (name) {
  return name.includes(' ') ? 'Name cannot include spaces.' : true
}

module.exports = DeleteGroupCommand
