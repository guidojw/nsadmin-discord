'use strict'
const pluralize = require('pluralize')
const BaseStructure = require('./base')
const TicketGuildMemberManager = require('../managers/ticket-guild-member')

const { MessageEmbed } = require('discord.js')
const { roVerAdapter } = require('../adapters')
const { stripIndents } = require('common-tags')
const { timeHelper } = require('../helpers')
const { discordService } = require('../services')

class Ticket extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.guild = guild

    this._moderators = []

    this._setup(data)
  }

  _setup (data) {
    this.id = data.id
    this.authorId = data.authorId
    this.channelId = data.channelId
    this.guildId = data.guildId
    this.type = this.guild.ticketTypes.resolve(data.type.id)

    if (data.moderators) {
      this._moderators = data.moderators.map(moderator => moderator.id)
    }
  }

  get author () {
    return this.authorId !== null
      ? this.guild.members.cache.get(this.authorId) ||
        (this.client.options.partials.includes('GUILD_MEMBER')
          ? this.guild.members.add({ id: this.authorId })
          : null)
      : null
  }

  get channel () {
    return this.guild.channels.cache.get(this.channelId) || null
  }

  get moderators () {
    return new TicketGuildMemberManager(this)
  }

  async populateChannel () {
    let username
    let userId
    try {
      const response = (await roVerAdapter('get', `/user/${this.authorId}`)).data
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

    const ticketInfoEmbed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setTitle('Ticket Information')
      .setDescription(stripIndents`
      Username: ${username ? '**' + username + '**' : '*unknown (user is not verified with RoVer)*'}
      User ID: ${userId ? '**' + userId + '**' : '*unknown (user is not verified with RoVer)*'}
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
    await this.client.send(this.author, embed)

    if (success && this.guild.ratingsChannel && this.author) {
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
    for (let i = 5; i >= 1; i--) {
      options.push(discordService.getEmojiFromNumber(i))
    }

    let rating = await discordService.prompt(this.author, this.author, message, options)
    rating = rating && rating.substring(0, 1)
    return rating
  }

  async logRating (rating) {
    await Promise.all([...this.moderators.cache.map(moderator => moderator.fetch())])
    const moderatorsString = makeCommaSeparatedString(this.moderators.cache.map(moderator => `**${moderator.tag}**`)) ||
      'none'

    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setAuthor(this.author.tag, this.author.displayAvatarURL())
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

function makeCommaSeparatedString (arr) {
  if (arr.length === 1) {
    return arr[0]
  }
  const firsts = arr.slice(0, arr.length - 1)
  const last = arr[arr.length - 1]
  return firsts.join(', ') + ' & ' + last
}

module.exports = Ticket
