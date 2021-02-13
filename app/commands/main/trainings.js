'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { applicationAdapter } = require('../../adapters')
const { timeHelper } = require('../../helpers')
const { groupService, userService } = require('../../services')

class TrainingsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'trainings',
      aliases: ['traininglist', 'training', 'traininginfo'],
      description: 'Lists info of all trainings/training with given ID.',
      clientPermissions: ['SEND_MESSAGES'],
      details: 'TrainingId must be the ID of a currently scheduled training.',
      args: [{
        key: 'trainingId',
        type: 'integer',
        prompt: 'Of which training would you like to know the information?',
        default: ''
      }]
    })
  }

  async run (message, { trainingId }) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
    if (trainingId) {
      const training = (await applicationAdapter('get', `/v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}`))
        .data
      const username = (await userService.getUser(training.authorId).name)
      const date = new Date(training.date)

      const embed = new MessageEmbed()
        .setTitle(`Training ${training.id}`)
        .addField('Type', training.type.abbreviation, true)
        .addField('Date', timeHelper.getDate(date), true)
        .addField('Time', `${timeHelper.getTime(date)} ${timeHelper.isDST(date) ? 'CEST' : 'CET'}`, true)
        .addField('Host', username, true)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      const trainings = (await applicationAdapter('get', `/v1/groups/${message.guild.robloxGroupId}/trainings?sort=date`))
        .data
      if (trainings.length === 0) {
        return message.reply('There are currently no hosted trainings.')
      }

      const embeds = await groupService.getTrainingEmbeds(trainings)
      for (const embed of embeds) {
        await message.author.send(embed)
      }
      return message.reply('Sent you a DM with the upcoming trainings.')
    }
  }
}

module.exports = TrainingsCommand
