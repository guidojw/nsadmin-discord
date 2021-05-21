import { ArgumentType, CommandoClient, CommandoMessage } from 'discord.js-commando'
import { Message } from 'discord.js'

const messageUrlRegex = /^https:\/\/discord.com\/channels\/([0-9]+|@me)\/[0-9]+\/[0-9]+$/
const endpointUrl = 'https://discord.com/channels/'

export default class MessageArgumentType extends ArgumentType {
  constructor (client: CommandoClient) {
    super(client, 'message')
  }

  async validate (val: string, msg: CommandoMessage): Promise<boolean> {
    const match = val.match(messageUrlRegex)
    if (match === null) {
      return false
    }
    const [guildId, channelId, messageId] = match[0]
      .replace(endpointUrl, '')
      .split('/')
    const channel = guildId === msg.guild.id
      ? msg.guild.channels.cache.get(channelId)
      : guildId === '@me'
        ? msg.channel
        : undefined
    if (typeof channel === 'undefined') {
      return false
    }
    try {
      return Boolean(channel.isText() && await channel.messages.fetch(messageId))
    } catch {
      return false
    }
  }

  parse (val: string, msg: CommandoMessage): Message | undefined {
    const match = val.match(messageUrlRegex)
    if (match === null) {
      return undefined
    }
    const [, channelId, messageId] = match[0]
      .replace(endpointUrl, '')
      .split('/')
    const channel = typeof msg.guild !== 'undefined' ? msg.guild.channels.cache.get(channelId) : msg.channel
    return typeof channel !== 'undefined' && channel.isText()
      ? channel.messages.cache.get(messageId)
      : undefined
  }
}
