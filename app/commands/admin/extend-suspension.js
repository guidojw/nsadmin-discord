'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { validators, noChannels, noTags, noUrls } = require('../../util').argumentUtil

class ExtendSuspensionCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'extendsuspension',
      details: 'A suspension can be max 7 days long.',
      aliases: ['extend'],
      description: 'Extends the suspension of given user.',
      examples: ['extend Happywalker 3 He still doesn\'t understand.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      requiresVerification: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Whose suspension would you like to extend?'
      }, {
        key: 'days',
        type: 'integer',
        prompt: 'With how many days would you like to extend this person\'s suspension?',
        min: 1,
        max: 7
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason are you extending this person\'s suspension?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { user, days, reason }) {
    await applicationAdapter('post', `/v1/groups/${message.guild.robloxGroupId}/suspensions/${user.id}/extend`, {
      authorId: message.member.robloxId,
      duration: days * 86400000,
      reason
    })

    return message.reply(`Successfully extended **${user.username ?? user.id}**'s suspension.`)
  }
}

module.exports = ExtendSuspensionCommand
