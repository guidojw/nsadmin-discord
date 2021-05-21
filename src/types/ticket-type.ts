import BaseArgumentType from './base'
import { CommandoClient } from 'discord.js-commando'
import { TicketType } from '../structures'

export default class TicketTypeArgumentType extends BaseArgumentType<TicketType> {
  constructor (client: CommandoClient) {
    super(client, TicketType)
  }
}
