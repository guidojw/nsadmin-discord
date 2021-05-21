import { Argument, ArgumentType, CommandoClient, CommandoMessage } from 'discord.js-commando'
import { GuildMember } from 'discord.js'
import { userService } from '../services'

interface RobloxUser { id: number, username?: string }

export default class RobloxUserArgumentType extends ArgumentType {
  protected readonly cache: Map<string, RobloxUser>

  constructor (client: CommandoClient) {
    super(client, 'roblox-user')

    this.cache = new Map()
  }

  async validate (val: string, msg: CommandoMessage, arg: Argument): Promise<boolean> {
    const key = `${msg.guild.id}_${val}`

    // val is undefined when the argument's default is set to "self" and no argument input is given (see isEmpty).
    // This patch was done in order to allow validation of the default value; the message member's Roblox user.
    if (typeof val === 'undefined') {
      const verificationData = await msg.member.fetchVerificationData()
      return this.validateAndSet(arg, key, verificationData.robloxId, verificationData.robloxUsername)
    }

    const match = val.match(/^(?:<@!?)?([0-9]+)>?$/)
    if (match !== null) {
      try {
        const member = await msg.guild.members.fetch(await msg.client.users.fetch(match[1]))
        if (!member.user.bot) {
          const verificationData = await member.fetchVerificationData()
          if (verificationData !== null) {
            return this.validateAndSet(arg, key, verificationData.robloxId, verificationData.robloxUsername)
          }
        }
      } catch {} // eslint-disable-line no-empty

      const id = parseInt(match[0].match(/^(\d+)$/)?.[1] ?? '')
      if (!isNaN(id)) {
        try {
          const username = (await userService.getUser(id)).name
          return this.validateAndSet(arg, key, id, username)
        } catch {} // eslint-disable-line no-empty
      } else {
        return false
      }
    }

    const search = val.toLowerCase()
    const members = msg.guild?.members.cache.filter(memberFilterExact(search))
    if (members?.size === 1) {
      const member = members.first()
      if (typeof member !== 'undefined' && !member.user.bot) {
        const verificationData = await member.fetchVerificationData()
        if (verificationData !== null) {
          return this.validateAndSet(arg, key, verificationData.robloxId, verificationData.robloxUsername)
        }
      }
    }

    if (!search.includes(' ')) {
      try {
        const id = await userService.getIdFromUsername(search)
        return this.validateAndSet(arg, key, id, search)
      } catch {} // eslint-disable-line no-empty
    }
    return false
  }

  parse (val: string, msg: CommandoMessage): RobloxUser | null {
    const key = `${msg.guild.id}_${val}`
    const result = this.cache.get(key)
    this.cache.delete(key)
    return result ?? null
  }

  isEmpty (val: string, msg: CommandoMessage, arg: Argument): boolean {
    return arg.default === 'self' ? false : super.isEmpty(val, msg, arg)
  }

  private validateAndSet (arg: Argument, key: string, id: number, username?: string): boolean {
    if (arg.oneOf?.includes(String(id)) ?? true) {
      this.cache.set(key, { id, username })
      return true
    }
    return false
  }
}

function memberFilterExact (search: string): (member: GuildMember) => boolean {
  return (member: GuildMember) => member.user.username.toLowerCase() === search ||
    (member.nickname !== null && member.nickname.toLowerCase() === search) ||
    `${member.user.username.toLowerCase()}#${member.user.discriminator}` === search
}
