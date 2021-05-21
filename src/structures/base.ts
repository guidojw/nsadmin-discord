import { CommandoClient } from 'discord.js-commando'

export default class BaseStructure {
  readonly client: CommandoClient

  constructor (client: CommandoClient) {
    this.client = client
  }

  _setup (data: any): any {
    return data
  }
}
