import {
  APIMessage,
  Constants,
  DiscordAPIError,
  Guild,
  Intents,
  Message,
  MessageOptions,
  Presence,
  User
} from 'discord.js'
import {
  CommandoClient,
  // Commando doesn't export these. PR a fix and uncomment this + fix Client.bindEvent when merged.
  // CommandoClientEvents,
  CommandoClientOptions,
  CommandoMessage,
  Inhibition
} from 'discord.js-commando'
import AroraProvider from './setting-provider'
import WebSocketManager from './websocket/websocket'
import applicationConfig from '../configs/application'
import eventHandlers from './events'
import path from 'path'

const { PartialTypes } = Constants

const ACTIVITY_CAROUSEL_INTERVAL = 60 * 1000

require('../extensions') // Extend Discord.js structures before the client's collections get instantiated.

export default class AroraClient extends CommandoClient {
  public mainGuild: Guild | null

  private readonly aroraWs: WebSocketManager
  private currentActivity: number
  private activityCarouselInterval: NodeJS.Timeout | null

  public constructor (options: CommandoClientOptions = {}) {
    if (typeof options.commandPrefix === 'undefined') {
      options.commandPrefix = applicationConfig.defaultPrefix
    }
    if (typeof options.owner === 'undefined') {
      options.owner = applicationConfig.owner
    }
    if (typeof options.invite === 'undefined') {
      options.invite = applicationConfig.invite
    }
    if (typeof options.ws === 'undefined') {
      options.ws = {}
    }
    if (typeof options.ws.intents === 'undefined') {
      options.ws.intents = []
    }
    const intentsArray = options.ws.intents as number[]
    if (!intentsArray.includes(Intents.FLAGS.GUILDS)) {
      intentsArray.push(Intents.FLAGS.GUILDS)
    }
    if (!intentsArray.includes(Intents.FLAGS.GUILD_MEMBERS)) {
      intentsArray.push(Intents.FLAGS.GUILD_MEMBERS)
    }
    if (!intentsArray.includes(Intents.FLAGS.GUILD_VOICE_STATES)) {
      intentsArray.push(Intents.FLAGS.GUILD_VOICE_STATES)
    }
    if (!intentsArray.includes(Intents.FLAGS.GUILD_MESSAGES)) {
      intentsArray.push(Intents.FLAGS.GUILD_MESSAGES)
    }
    if (!intentsArray.includes(Intents.FLAGS.GUILD_MESSAGE_REACTIONS)) {
      intentsArray.push(Intents.FLAGS.GUILD_MESSAGE_REACTIONS)
    }
    if (!intentsArray.includes(Intents.FLAGS.DIRECT_MESSAGES)) {
      intentsArray.push(Intents.FLAGS.DIRECT_MESSAGES)
    }
    if (typeof options.partials === 'undefined') {
      options.partials = []
    }
    if (!options.partials.includes(PartialTypes.GUILD_MEMBER)) {
      options.partials.push(PartialTypes.GUILD_MEMBER)
    }
    if (!options.partials.includes(PartialTypes.REACTION)) {
      options.partials.push(PartialTypes.REACTION)
    }
    if (!options.partials.includes(PartialTypes.MESSAGE)) {
      options.partials.push(PartialTypes.MESSAGE)
    }
    if (!options.partials.includes(PartialTypes.USER)) {
      options.partials.push(PartialTypes.USER)
    }
    super(options)

    this.mainGuild = null

    this.currentActivity = 0
    this.activityCarouselInterval = null

    this.registry
      .registerDefaultGroups()
      .registerDefaultTypes({ message: false })
      .registerDefaultCommands({
        help: true,
        prefix: true,
        eval: true,
        ping: true,
        unknownCommand: false,
        commandState: true
      })
      .unregisterCommand(this.registry.resolveCommand('groups')) // returns void..
    this.registry
      .registerGroup('admin', 'Admin')
      .registerGroup('bot', 'Bot')
      .registerGroup('main', 'Main')
      .registerGroup('settings', 'Settings')
      .registerTypesIn({ dirname: path.join(__dirname, '../types'), filter: /^(?!base.js).+$/ })
      .registerCommandsIn(path.join(__dirname, '../commands'))

    this.dispatcher.addInhibitor(requiresApiInhibitor)
    this.dispatcher.addInhibitor(requiresRobloxGroupInhibitor)
    this.dispatcher.addInhibitor(requiresSingleGuildInhibitor)

    if (applicationConfig.apiEnabled === true) {
      this.aroraWs = new WebSocketManager(this)
    }

    this.once('ready', () => this.ready.bind(this))
  }

  private async ready (): Promise<void> {
    await this.setProvider(new AroraProvider())

    const mainGuildId = process.env.NODE_ENV === 'production'
      ? applicationConfig.productionMainGuildId
      : applicationConfig.developmentMainGuildId
    this.mainGuild = this.guilds.cache.get(mainGuildId) ?? null

    this.bindEvent('channelDelete')
    this.bindEvent('commandCancel')
    this.bindEvent('commandError')
    this.bindEvent('commandPrefixChange')
    this.bindEvent('commandRun')
    this.bindEvent('commandStatusChange')
    this.bindEvent('emojiDelete')
    this.bindEvent('groupStatusChange')
    this.bindEvent('guildCreate')
    this.bindEvent('guildMemberAdd')
    this.bindEvent('guildMemberUpdate')
    this.bindEvent('message')
    this.bindEvent('messageDelete')
    this.bindEvent('messageDeleteBulk')
    this.bindEvent('messageReactionAdd')
    this.bindEvent('messageReactionRemove')
    this.bindEvent('roleDelete')
    this.bindEvent('voiceStateUpdate')

    await this.startActivityCarousel()

    console.log(`Ready to serve on ${this.guilds.cache.size} servers, for ${this.users.cache.size} users.`)
  }

  public async startActivityCarousel (): Promise<Presence | null> {
    if (typeof this.activityCarouselInterval === 'undefined') {
      this.activityCarouselInterval = this.setInterval(() => this.nextActivity.bind(this), ACTIVITY_CAROUSEL_INTERVAL)
      return await this.nextActivity(0)
    }
    return null
  }

  public stopActivityCarousel (): void {
    if (typeof this.activityCarouselInterval !== 'undefined') {
      this.clearInterval(this.activityCarouselInterval)
      this.activityCarouselInterval = undefined
    }
  }

  public async nextActivity (activity?: number): Promise<Presence> {
    if (this.user === null) {
      throw new Error('Can\'t set activity when the client is not logged in.')
    }

    this.currentActivity = (activity ?? this.currentActivity + 1) % 2
    switch (this.currentActivity) {
      case 0: {
        let totalMemberCount = 0
        for (const guild of this.guilds.cache.values()) {
          totalMemberCount += guild.memberCount
        }
        return await this.user.setActivity(`${totalMemberCount} users`, { type: 'WATCHING' })
      }
      default:
        return await this.user.setActivity(`${this.commandPrefix}help`, { type: 'LISTENING' })
    }
  }

  public async send (user: User, content: string | APIMessage | MessageOptions): Promise<Message | Message[]> {
    return await failSilently(user.send.bind(user, content), [50007])
    // 50007: Cannot send messages to this user, user probably has DMs closed.
  }

  public async deleteMessage (message: Message): Promise<void> {
    return await failSilently(message.delete.bind(message), [10008, ...(message.channel.type === 'dm' ? [50003] : [])])
    // 10008: Unknown message, the message was probably already deleted.
    // 50003: Cannot execute action on a DM channel, the bot cannot delete user messages in DMs.
  }

  public async login (token = this.token): Promise<string> {
    const usedToken = await super.login(token ?? undefined)
    this.aroraWs?.connect()
    return usedToken
  }

  // See comment in discord.js-commando imports.
  // private bindEvent (eventName: CommandoClientEvents): void {
  private bindEvent (eventName: string): void {
    const handler = eventHandlers[eventName]
    // @ts-expect-error
    this.on(eventName, (...args) => handler(this, ...args))
  }
}

function requiresApiInhibitor (msg: CommandoMessage): false | Inhibition {
  if (msg.command?.requiresApi === true && applicationConfig.apiEnabled !== true) {
    return {
      reason: 'apiRequired',
      response: msg.reply('This command requires that the bot has an API connected.')
    }
  }
  return false
}

function requiresRobloxGroupInhibitor (msg: CommandoMessage): false | Inhibition {
  if (msg.command?.requiresRobloxGroup === true && (msg.guild === null || msg.guild.robloxGroupId === null)) {
    return {
      reason: 'robloxGroupRequired',
      response: msg.reply('This command requires that the server has its robloxGroup setting set.')
    }
  }
  return false
}

function requiresSingleGuildInhibitor (msg: CommandoMessage): false | Inhibition {
  if (msg.command?.requiresSingleGuild === true && msg.client.guilds.cache.size !== 1) {
    return {
      reason: 'singleGuildRequired',
      response: msg.reply('This command requires the bot to be in only one guild.')
    }
  }
  return false
}

async function failSilently (
  fn: ((...args: any[]) => Promise<any>) | ((...args: any[]) => Exclude<any, Promise<any>>),
  codes: number[]
): Promise<any> {
  try {
    return fn.constructor.name === 'AsyncFunction' ? await (fn as (...args: any[]) => Promise<any>)() : fn()
  } catch (err) {
    if (!(err instanceof DiscordAPIError) || !codes.includes(err.code)) {
      throw err
    }
  }
}