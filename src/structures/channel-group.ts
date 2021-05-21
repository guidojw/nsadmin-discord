import { CommandoClient } from 'discord.js-commando'
import Group from './group'
import GroupTextChannelManager from '../managers/group-text-channel'
import { Guild } from 'discord.js'

export default class ChannelGroup extends Group {
  _channels: string[]

  constructor (client: CommandoClient, data: any, guild: Guild) {
    super(client, data, guild)

    this._channels = []

    this._setup(data)
  }

  _setup (data: any): void {
    super._setup(data)

    if (typeof data.channels !== 'undefined') {
      this._channels = data.channels.map((channel: { id: string }) => channel.id)
    }
  }

  get channels (): GroupTextChannelManager {
    return new GroupTextChannelManager(this)
  }
}
