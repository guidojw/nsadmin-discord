import BaseArgumentType from './base'
import { CommandoClient } from 'discord.js-commando'
import { Panel } from '../structures'

export default class PanelArgumentType extends BaseArgumentType<Panel> {
  constructor (client: CommandoClient) {
    super(client, Panel)
  }
}
