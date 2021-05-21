import BaseArgumentType, { FilterableArgumentType } from './base'
import { BaseStructure } from '../structures'
import { CommandoClient } from 'discord.js-commando'
import { Tag } from '../structures'

export default class TagArgumentType extends BaseArgumentType<Tag> implements FilterableArgumentType {
  constructor (client: CommandoClient) {
    super(client, Tag)
  }

  filterExact (search: string): (structure: BaseStructure) => boolean {
    return (structure) => structure instanceof this.holds && structure.names.resolve(search) !== null
  }

  filterInexact (search: string): (structure: BaseStructure) => boolean {
    return (structure) => structure instanceof this.holds && structure.names.cache.some(tagName => (
      tagName.name.toLowerCase().includes(search)
    ))
  }
}
