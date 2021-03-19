'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')

class TagCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'tag',
      description: 'Posts given tag.',
      examples: ['tag rr'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        type: 'integer|string',
        prompt: 'What tag would you like to check out?'
      }]
    })
  }

  run (message, { tag }) {
    if (tag !== 'all') {
      tag = message.guild.tags.resolve(tag)
      if (!tag) {
        return message.reply('Tag not found.')
      }

      return message.reply(tag.content, { allowedMentions: { users: [message.author.id] } })
    } else {
      let list = ''
      for (const tag of message.guild.tags.cache.values()) {
        list += `${tag.id}. ${makeCommaSeparatedString(tag.names.cache.map(tagName => `**${tagName.name}**`))}\n`
      }

      const embed = new MessageEmbed()
        .setTitle('Tags')
        .setDescription(list)
        .setFooter(`Page 1/1 (${message.guild.tags.cache.size} entries)`)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    }
  }
}

function makeCommaSeparatedString (arr) {
  if (arr.length === 1) {
    return arr[0]
  }
  const firsts = arr.slice(0, arr.length - 1)
  const last = arr[arr.length - 1]
  return firsts.join(', ') + ' & ' + last
}

module.exports = TagCommand
