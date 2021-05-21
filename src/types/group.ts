import BaseArgumentType from './base'
import { CommandoClient } from 'discord.js-commando'
import { Group } from '../structures'

export default class GroupArgumentType extends BaseArgumentType<Group> {
  constructor (client: CommandoClient) {
    super(client, Group)
  }
}
