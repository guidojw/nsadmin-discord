'use strict'
const BaseStructure = require('./base')

class TicketType extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.guild = guild

    this._setup(data)
  }

  _setup (data) {
    this.id = data.id
    this.name = data.name
    this._emoji = data.emoji
    this._emojiId = data.emojiId
    this.panelId = data.panelId
  }

  get emoji () {
    return this._emoji || this.guild.emojis.cache.get(this._emojiId) || null
  }

  get panel () {
    return this.guild.panels.cache.get(this.panelId) || null
  }

  update (data) {
    return this.guild.ticketTypes.update(this, data)
  }

  delete () {
    return this.guild.ticketTypes.delete(this)
  }

  bind (panel, emoji) {
    return this.guild.ticketTypes.bind(this, panel, emoji)
  }
}

module.exports = TicketType
