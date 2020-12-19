'use strict'
const EventEmitter = require('events')
const pluralize = require('pluralize')
const discordService = require('../services/discord')
const roVerAdapter = require('../adapters/rover')
const timeHelper = require('../helpers/time')

const { MessageEmbed } = require('discord.js')
const { stripIndents } = require('common-tags')
const { Ticket, TicketModerator } = require('../models')

const TicketType = {
  PERSON_REPORT: 'personReport',
  BUG_REPORT: 'bugReport',
  PRIZE_CLAIM: 'prizeClaim'
}

const SUBMISSION_TIME = 30 * 60 * 1000

class TicketController extends EventEmitter {
  constructor (client, data) {
    super()

    this.client = client

    this._patch(data)
  }

  _patch (data) {
    this.id = data.id
    this.authorId = data.authorId || null
    this.channelId = data.channelId || null
    this.guildId = data.guildId || null
    this.type = data.type || null
    this._moderators = data.moderators
  }

  get ticketsController () {
    return this.client.bot.ticketsController || null
  }

  get author () {
    return this.client.users.cache.get(this.authorId) ||
      (this.client.options.partials.includes('USER')
        ? this.client.users.add({ id: this.authorId })
        : null)
  }

  get channel () {
    return this.guild.guild.channels.cache.get(this.channelId)
  }

  get guild () {
    return this.client.bot.getGuild(this.guildId) || null
  }

  get moderators () {
    return this._moderators.map(moderator => {
      return this.client.users.cache.get(moderator.userId) ||
        (this.client.options.partials.includes('USER')
          ? this.client.users.add({ id: moderator.userId })
          : null)
    })
  }

  async start () {
    await this.createChannel()
    await this.populateChannel()

    this.timeout = setTimeout(this.close.bind(this, 'Timeout: ticket closed'), SUBMISSION_TIME)

    await this.submit()
  }

  async createChannel () {
    if (this.author.partial) {
      await this.author.fetch()
    }
    const name = `${this.type}-${this.author.username}`
    const channel = await this.guild.guild.channels.create(name)

    await this.edit({ channelId: channel.id })
    await this.channel.setParent(this.guild.ticketsCategory)
    await this.channel.updateOverwrite(this.author, { VIEW_CHANNEL: true })
  }

  async populateChannel () {
    let username
    let userId
    try {
      const response = (await roVerAdapter('get', `/user/${this.author.id}`)).data
      username = response.robloxUsername
      userId = response.robloxId
    } catch (err) {
      if (err.response.status !== 404) {
        throw err
      }
    }

    const date = new Date()
    const readableDate = timeHelper.getDate(date)
    const readableTime = timeHelper.getTime(date)

    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setTitle('Ticket Information')
      .setDescription(stripIndents`
      Username: ${username ? '**' + username + '**' : '*unknown (user is not verified with RoVer)*'}
      User ID: ${userId ? '**' + userId + '**' : '*unknown (user is not verified with RoVer)*'}
      Start time: ${readableDate + ' ' + readableTime}
      `)
      .setFooter(`Ticket ID: ${this.id} | ${this.type
        .split(/(?=[A-Z])/)
        .map(string => string.toLowerCase())
        .join(' ')
      }`)
    return this.channel.send(`${this.author}`, { embed })
  }

  async submit () {
    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setDescription(stripIndents`
      A Ticket Moderator will be with you shortly.
      This may take up to 24 hours. You can still close your ticket by using the \`/closeticket\` command.
      `)
    await this.channel.send(embed)

    // const roles = this.guild.getData('roles')
    // await this.channel.updateOverwrite(roles.ticketModeratorRole, { VIEW_CHANNEL: true })

    this.guild.log(
      this.author,
      `${this.author} **opened ticket** \`${this.id}\` **in** ${this.channel}`,
      { footer: `Ticket ID: ${this.id}` }
    )
  }

  async close (message, success, color) {
    if (this.channel) {
      await this.channel.delete()
    }

    const embed = new MessageEmbed()
      .setColor(color || success ? 0x00ff00 : 0xff0000)
      .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
      .setTitle(message)
    await this.client.bot.send(this.author, embed)

    if (this.guild.ratingsChannel && success) {
      const rating = await this.requestRating()

      if (rating) {
        this.logRating(rating)

        const embed = new MessageEmbed()
          .setColor(this.guild.primaryColor)
          .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
          .setTitle('Rating submitted')
          .setDescription('Thank you!')
        this.client.bot.send(this.author, embed)
      } else {
        const embed = new MessageEmbed()
          .setColor(this.guild.primaryColor)
          .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
          .setTitle('No rating submitted')
        this.client.bot.send(this.author, embed)
      }
    }

    await Ticket.destroy({ where: { id: this.id } })

    this.emit('close')
  }

  async requestRating () {
    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
      .setTitle('How would you rate the support you got?')
    const message = await this.client.bot.send(this.author, embed)

    const options = []
    for (let i = 5; i >= 1; i--) {
      options.push(discordService.getEmojiFromNumber(i))
    }

    let rating = await discordService.prompt(this.author, this.author, message, options)
    rating = rating && rating.substring(0, 1)
    return rating
  }

  async logRating (rating) {
    let result = ''
    for (let i = 0; i < this.moderators.length; i++) {
      const moderator = this.moderators[i]
      if (moderator.partial) {
        await moderator.fetch()
      }

      result += `**${moderator.tag}**`
      if (i < this.moderators.length - 2) {
        result += ', '
      } else if (i === this.moderators.length - 2) {
        result += ' & '
      }
    }
    result = result || 'none'

    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setAuthor(this.author.tag, this.author.displayAvatarURL())
      .setTitle('Ticket Rating')
      .setDescription(stripIndents`
      ${pluralize('Moderator', this.moderators.length)}: ${result}
      Rating: **${rating}**
      `)
      .setFooter(`Ticket ID: ${this.id}`)
    return this.guild.ratingsChannel.send(embed)
  }

  static getTypeFromName (name) {
    for (const [type, typeName] of Object.entries(TicketType)) {
      if (typeName.toLowerCase() === name.toLowerCase()) {
        return type
      }
    }
  }

  async message (message) {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = undefined
    }

    if (message.author.id !== this.authorId) {
      if (!this.moderators.some(moderator => moderator.id === message.author.id)) {
        await TicketModerator.create({ ticketId: this.id, userId: message.author.id })
        const data = await Ticket.findByPk(this.id)
        this._patch(data)
      }
    }
  }

  async edit (data) {
    const ticket = await Ticket.findByPk(this.id)

    const newData = await ticket.update({
      channelId: data.channelId,
      type: data.type
    })

    this._patch(newData)
    return newData
  }
}

module.exports = {
  TicketController,
  TicketType
}
