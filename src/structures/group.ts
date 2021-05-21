import BaseStructure from './base'
import { CommandoClient } from 'discord.js-commando'
import { GroupType } from '../util/constants'
import { Guild } from 'discord.js'

export default class Group extends BaseStructure {
  readonly type: GroupType
  readonly guild: Guild
  id!: string
  name!: string
  guarded!: boolean

  constructor (client: CommandoClient, data: any, guild: Guild) {
    super(client)

    this.type = data.type

    this.guild = guild
  }

  _setup (data: any): void {
    this.id = data.id
    this.name = data.name
    this.guarded = data.guarded
  }

  toString (): string {
    return this.name
  }

  update (data: any): this {
    return this.guild.groups.update(this, data)
  }

  delete (): void {
    return this.guild.groups.delete(this)
  }

  static create (client: CommandoClient, data: any, guild: Guild): Group {
    let group
    switch (data.type) {
      case GroupType.Channel: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ChannelGroup = require('./channel-group')
        group = new ChannelGroup(client, data, guild)
        break
      }
      case GroupType.Role: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const RoleGroup = require('./role-group')
        group = new RoleGroup(client, data, guild)
        break
      }
    }
    return group
  }
}
