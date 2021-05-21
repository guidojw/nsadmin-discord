import { Constants, Guild, GuildChannel, Message } from 'discord.js'
import BaseStructure from '../base'
import { CommandoClient } from 'discord.js-commando'

const { PartialTypes } = Constants

export default class Postable {
  readonly client: CommandoClient
  readonly guild: Guild
  messageId: string | null
  channelId: string | null

  constructor (client: CommandoClient, data: any, guild: Guild) {
    this.client = client
    this.guild = guild

    this.messageId = data.message?.id ?? null
    this.channelId = data.message?.channelId ?? null
  }

  get channel (): GuildChannel | null {
    return this.channelId !== null ? this.guild.channels.cache.get(this.channelId) ?? null : null
  }

  get message (): Message | null {
    return this.messageId !== null && this.channel !== null && this.channel.isText()
      ? this.channel.messages.cache.get(this.messageId) ??
      (this.client.options.partials?.includes(PartialTypes.MESSAGE) === true
        ? this.channel.messages.add({ id: this.messageId })
        : null)
      : null
  }

  static applyToClass (structure: BaseStructure): void {
    const props = ['channel', 'message']
    for (const prop of props) {
      Object.defineProperty(
        // @ts-expect-error
        structure.prototype,
        prop,
        Object.getOwnPropertyDescriptor(Postable.prototype, prop) as PropertyDescriptor
      )
    }
  }
}
