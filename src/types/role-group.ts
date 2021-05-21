import BaseArgumentType from './base'
import { CommandoClient } from 'discord.js-commando'
import { RoleGroup } from '../structures'

export default class RoleGroupArgumentType extends BaseArgumentType<RoleGroup> {
  constructor (client: CommandoClient) {
    super(client, RoleGroup, 'groups')
  }
}
