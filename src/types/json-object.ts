import { Argument, ArgumentType, CommandoClient, CommandoMessage } from 'discord.js-commando'

export default class JsonObjectArgumentType extends ArgumentType {
  constructor (client: CommandoClient) {
    super(client, 'json-object')
  }

  validate (val: string, _msg: CommandoMessage, arg: Argument): boolean | string {
    try {
      JSON.parse(val)
    } catch (err) {
      return false
    }
    if (arg.min !== null && typeof arg.min !== 'undefined' && val.length < arg.min) {
      return `Please keep the ${arg.label} above or exactly ${arg.min} characters.`
    }
    if (arg.max !== null && typeof arg.max !== 'undefined' && val.length > arg.max) {
      return `Please keep the ${arg.label} below or exactly ${arg.max} characters.`
    }
    return true
  }

  parse (val: string): any {
    return JSON.parse(val)
  }
}
