import { AbstractConstructor, Constructor } from '../../util/util'
import { Constants, Base as DiscordBaseStructure, Guild, Message, TextChannel } from 'discord.js'
import BaseStructure from '../base'

const { PartialTypes } = Constants

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Postable<T extends AbstractConstructor<BaseStructure> | Constructor<DiscordBaseStructure>> (
  Base: T
) {
  abstract class Postable extends Base {
    public abstract readonly guild: Guild
    public messageId!: string | null
    public channelId!: string | null

    public setup (data: any): void {
      super.setup?.(data)

      this.messageId = data.message?.id ?? null
      this.channelId = data.message?.channelId ?? null
    }

    public get channel (): TextChannel | null {
      return this.channelId !== null
        ? (this.guild.channels.cache.get(this.channelId) as TextChannel | undefined) ?? null
        : null
    }

    public get message (): Message | null {
      return this.messageId !== null && this.channel !== null && this.channel.isText()
        ? this.channel.messages.cache.get(this.messageId) ??
        (super.client.options.partials?.includes(PartialTypes.MESSAGE) === true
          ? this.channel.messages.add({ id: this.messageId })
          : null)
        : null
    }
  }

  return Postable
}