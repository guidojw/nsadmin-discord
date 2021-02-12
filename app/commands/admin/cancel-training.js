'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')

const { stringHelper } = require('../../helpers')
const { userService } = require('../../services')

class CancelTrainingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'canceltraining',
      details: 'TrainingId must be the ID of a currently scheduled training.',
      description: 'Cancels given training.',
      examples: ['canceltraining 1 Weird circumstances.'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'trainingId',
        type: 'integer',
        prompt: 'Which training would you like to cancel?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to cancel this training?',
        validate: val => stringHelper.getChannels(val)
          ? 'Reason contains channels.'
          : stringHelper.getTags(val)
            ? 'Reason contains tags.'
            : stringHelper.getUrls(val)
              ? 'Reason contains URLs.'
              : true
      }]
    })
  }

  async run (message, { trainingId, reason }) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
    const authorId = await userService.getIdFromUsername(message.member.displayName)

    await applicationAdapter('post', `/v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}/cancel`, {
      authorId,
      reason
    })

    return message.reply(`Successfully cancelled training with ID **${trainingId}**.`)
  }
}

module.exports = CancelTrainingCommand
