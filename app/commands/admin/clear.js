'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class ClearCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'clearchannel',
      aliases: ['clear'],
      description: 'Clears given channel.',
      details: 'Only channels #suggestions and #trainings can be cleared. This will delete all messages but the ' +
        'important information ones.',
      examples: ['clear #suggestions'],
      clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES'],
      ownerOnly: true,
      args: [{
        key: 'channel',
        prompt: 'What channel would you like to clear?',
        type: 'channel'
      }]
    })
  }

  async execute (message, { channel }, guild) {
    const channels = guild.getData('channels')
    const suggestionsChannelId = channels.suggestionsChannel
    const trainingsChannelId = channels.trainingsChannel

    if (channel.id !== suggestionsChannelId && channel.id !== trainingsChannelId) {
      return message.reply(`Can only clear <#${suggestionsChannelId}> or <#${trainingsChannelId}>.`)
    }

    const prompt = await message.reply(`Are you sure you would like to clear ${channel}?`)
    const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅', '🚫']) === '✅'

    if (choice) {
      const guildMessages = guild.getData('messages')
      let messages
      do {
        const after = channel.id === suggestionsChannelId
          ? guildMessages.firstSuggestionMessage
          : guildMessages.trainingsMessage
        messages = await channel.messages.fetch({ after })
        if (messages.size > 0) {
          try {
            await channel.bulkDelete(messages)
          } catch (err) {
            for (const message of messages.values()) {
              await message.delete()
            }
          }
        }
      } while (messages.size > 0)
      message.reply(`Successfully cleared ${channel}.`)
    } else {
      message.reply(`Didn't clear ${channel}.`)
    }
  }
}
