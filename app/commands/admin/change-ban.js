'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')
const { getChannels, getTags, getUrls } = require('../../helpers/string')

module.exports = class ChangeBanCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'changeban',
      details: 'Key must be author or reason. You can only change the author of bans you created.',
      description: 'Changes given user\'s ban\'s key to given data.',
      examples: ['changeban Happywalker author builderman'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Whose ban would you like to change?'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to change?',
        oneOf: ['author', 'reason']
      }, {
        key: 'data',
        type: 'string',
        prompt: 'What would you like to change this key\'s data to?'
      }]
    })
  }

  async execute (message, { username, key, data }) {
    key = key.toLowerCase()
    const changes = {}
    if (key === 'author') {
      changes.authorId = await userService.getIdFromUsername(data)
    } else if (key === 'reason') {
      const error = getChannels(data)
        ? 'Reason contains channels.'
        : getTags(data)
          ? 'Reason contains tags.'
          : getUrls(data)
            ? 'Reason contains URLs.'
            : undefined
      if (error) {
        return message.reply(error)
      }
      changes.reason = data
    }
    username = typeof username === 'string' ? username : username.displayName
    const [userId, editorId] = await Promise.all([userService.getIdFromUsername(username), userService
      .getIdFromUsername(message.member.displayName)])
    await applicationAdapter('put', `/v1/bans/${userId}`, { changes, editorId })
    message.reply(`Successfully changed **${username}**'s ban.`)
  }
}
