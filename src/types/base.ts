import { Argument, ArgumentType, CommandoClient, CommandoMessage, util } from 'discord.js-commando'
import { BaseStructure } from '../structures'
import { Constructable } from '../util/util'
import { Util } from 'discord.js'
import lodash from 'lodash'
import pluralize from 'pluralize'

const { disambiguation } = util
const { escapeMarkdown } = Util

export default class BaseArgumentType<T extends BaseStructure> extends ArgumentType implements FilterableArgumentType {
  readonly holds: Constructable<T>
  private readonly managerName: string
  private readonly label: string

  constructor (client: CommandoClient, holds: Constructable<T>, managerName?: string) {
    let id = lodash.kebabCase(holds.name)
    if (client.registry.types.has(id)) {
      id = `arora-${id}`
    }
    super(client, id)

    this.holds = holds
    this.managerName = typeof managerName === 'undefined'
      ? pluralize(lodash.camelCase(holds.name))
      : managerName

    this.label = this.id.replace(/-/g, ' ')
  }

  validate (val: string, msg: CommandoMessage, arg: Argument): boolean | string {
    if (typeof msg.guild === 'undefined') {
      return false
    }
    const id = parseInt(val)
    if (!isNaN(id)) {
      const structure = msg.guild[this.managerName].cache.get(id)
      if (typeof structure === 'undefined') {
        return false
      }
      return arg.oneOf?.includes(structure.id) ?? true
    }
    const search = val.toLowerCase()
    let structures = msg.guild[this.managerName].cache.filter(this.filterInexact(search))
    if (structures.size === 0) {
      return false
    }
    if (structures.size === 1) {
      return arg.oneOf?.includes(structures.first().id) ?? true
    }
    const exactStructures = structures.filter(this.filterExact(search))
    if (exactStructures.size === 1) {
      return arg.oneOf?.includes(exactStructures.first().id) ?? true
    }
    if (exactStructures.size > 0) {
      structures = exactStructures
    }
    return structures.size <= 15
      ? `${disambiguation(structures.map(structure => escapeMarkdown(structure.name)), pluralize(this.label), undefined)}\n`
      : `Multiple ${pluralize(this.label)} found. Please be more specific.`
  }

  parse (val: string, msg: CommandoMessage): T | null | false {
    if (typeof msg.guild === 'undefined') {
      return false
    }
    const id = parseInt(val)
    if (!isNaN(id)) {
      return msg.guild[this.managerName].cache.get(id) || null
    }
    const search = val.toLowerCase()
    const structures = msg.guild[this.managerName].cache.filter(this.filterInexact(search))
    if (structures.size === 0) {
      return null
    }
    if (structures.size === 1) {
      return structures.first()
    }
    const exactStructures = structures.filter(this.filterExact(search))
    if (exactStructures.size === 1) {
      return exactStructures.first()
    }
    return null
  }

  filterExact (search: string): (structure: BaseStructure) => boolean {
    return (structure) => structure instanceof this.holds && structure.name.toLowerCase() === search
  }

  filterInexact (search: string): (structure: BaseStructure) => boolean {
    return (structure) => structure instanceof this.holds && structure.name.toLowerCase().includes(search)
  }
}

export abstract class FilterableArgumentType {
  abstract filterExact: (search: string) => (structure: BaseStructure) => boolean
  abstract filterInexact: (search: string) => (structure: BaseStructure) => boolean
}
