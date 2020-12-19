'use strict'
const Command = require('../../controllers/command')

const { RoleBinding } = require('../../models')

class AddRoleBindingCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addrolebinding',
      aliases: ['addrolebnd'],
      description: 'Adds a new Roblox rank to Discord role binding.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'role',
        prompt: 'To what role would you like to bind this binding?',
        type: 'role'
      }, {
        key: 'min',
        prompt: 'What do you want the lower limit of this binding to be?',
        type: 'integer',
        validate: _validateRank
      }, {
        key: 'max',
        prompt: 'What do you want the upper limit of this binding to be? Reply with "0" if you don\'t want one.',
        type: 'integer',
        validate: _validateRank
      }]
    })
  }

  async execute (message, { role, min, max }, guild) {
    if (guild.robloxGroupId) {
      max = max === 0 ? undefined : max
      if (typeof max !== 'undefined' && max < min) {
        [min, max] = [max, min]
      }

      const roleBinding = await RoleBinding.findOne({
        where: {
          robloxGroupId: guild.robloxGroupId,
          guildId: guild.id,
          roleId: role.id,
          min,
          max
        }
      })
      if (roleBinding) {
        return message.reply('A role message with that message and range already exists.')
      }

      await RoleBinding.create({
        robloxGroupId: guild.robloxGroupId,
        guildId: guild.id,
        roleId: role.id,
        min,
        max
      })

      return message.reply('Successfully made role binding.')
    } else {
      return message.reply('This server is not bound to a Roblox group yet!')
    }
  }
}

function _validateRank(value) {
  return value >= 0 && value <= 255 || 'Invalid rank.'
}

module.exports = AddRoleBindingCommand
