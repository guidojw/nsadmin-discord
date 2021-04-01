'use strict'

const pluralize = require('pluralize')
const BaseStructure = require('./base')
const TicketGuildMemberManager = require('../managers/ticket-guild-member')

const { stripIndents } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { PartialTypes } = require('discord.js').Constants
const { discordService, userService } = require('../services')
const { getDate, getTime } = require('../util').timeUtil
const { makeCommaSeparatedString } = require('../util').util

class Ticket extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.guild = guild

    this._moderators = []

    this._setup(data)
  }

  _setup (data) {
    this.id = data.id
    this.channelId = data.channelId
    this.guildId = data.guildId
    this.typeId = data.typeId
    this.authorId = data.author.userId

    if (data.moderators) {
      this._moderators = data.moderators.map(moderator => moderator.userId)
    }
  }

  get author () {
    return this.authorId !== null
      ? this.guild.members.cache.get(this.authorId) ||
        (this.client.options.partials.includes(PartialTypes.GUILD_MEMBER)
          ? this.guild.members.add({ user: { id: this.authorId } })
          : null)
      : null
  }

  get channel () {
    return this.guild.channels.cache.get(this.channelId) || null
  }

  get type () {
    return this.guild.ticketTypes.cache.get(this.typeId)
  }

  get moderators () {
    return new TicketGuildMemberManager(this)
  }

  async populateChannel () {
    let robloxId, robloxUsername
    try {
      robloxId = this.author.robloxId ?? (await this.author.fetchVerificationData()).robloxId
      robloxUsername = this.author.robloxUsername ?? (await userService.getUser(robloxId)).name
    } catch {} // eslint-disable-line no-empty

    const date = new Date()
    const readableDate = getDate(date)
    const readableTime = getTime(date)
    const ticketInfoEmbed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setTitle('Ticket Information')
      .setDescription(stripIndents`
      Username: ${robloxUsername ? '**' + robloxUsername + '**' : '*unknown*'}
      User ID: ${robloxId ? '**' + robloxId + '**' : '*unknown*'}
      Start time: ${readableDate} ${readableTime}
      `)
      .setFooter(`Ticket ID: ${this.id} | ${this.type.name}`)
    await this.channel.send(this.author.toString(), { embed: ticketInfoEmbed })

    const modInfoEmbed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setDescription(stripIndents`
      A Ticket Moderator will be with you shortly.
      This may take up to 24 hours. You can still close your ticket by using the \`/closeticket\` command.
      `)
    return this.channel.send(modInfoEmbed)
  }

  async close (message, success, color) {
    if (this.channel) {
      await this.channel.delete()
    }

    const embed = new MessageEmbed()
      .setColor(color || success ? 0x00ff00 : 0xff0000)
      .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
      .setTitle(message)
    const sent = typeof await this.client.send(this.author, embed) !== 'undefined'

    if (sent && success && this.guild.ratingsChannel && this.author) {
      const rating = await this.requestRating()
      if (rating) {
        this.logRating(rating)

        const embed = new MessageEmbed()
          .setColor(this.guild.primaryColor)
          .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
          .setTitle('Rating submitted')
          .setDescription('Thank you!')
        this.client.send(this.author, embed)
      } else {
        const embed = new MessageEmbed()
          .setColor(this.guild.primaryColor)
          .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
          .setTitle('No rating submitted')
        this.client.send(this.author, embed)
      }
    }

    return this.delete()
  }

  async requestRating () {
    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
      .setTitle('How would you rate the support you got?')
    const message = await this.client.send(this.author, embed)

    const options = []
    for (let i = 1; i <= 5; i++) {
      options.push(`${i}⃣`)
    }

    let rating = await discordService.prompt(this.author, this.author, message, options)
    rating = rating && rating.substring(0, 1)
    return rating
  }

  async logRating (rating) {
    await Promise.allSettled([
      this.author.partial && this.author.fetch(),
      ...this.moderators.cache.map(moderator => moderator.partial && moderator.fetch())
    ])
    const moderatorsString = makeCommaSeparatedString(this.moderators.cache.map(moderator => {
      return `**${moderator.user.tag ?? moderator.id}**`
    })) || 'none'

    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setAuthor(this.author.user.tag ?? this.author.id, this.author.user.displayAvatarURL())
      .setTitle('Ticket Rating')
      .setDescription(stripIndents`
      ${pluralize('Moderator', this.moderators.cache.size)}: ${moderatorsString}
      Rating: **${rating}**
      `)
      .setFooter(`Ticket ID: ${this.id}`)
    return this.guild.ratingsChannel.send(embed)
  }

  update (data) {
    return this.guild.tickets.update(this, data)
  }

  delete () {
    return this.guild.tickets.delete(this)
  }

  onMessage (message) {
    if (message.member.id === this.authorId) {
      if (this.timeout) {
        this.client.clearTimeout(this.timeout)
        this.timeout = undefined
      }
    } else {
      if (!this.moderators.cache.has(message.member.id)) {
        return this.moderators.add(message.member)
      }
    }
  }
}

module.exports = Ticket
