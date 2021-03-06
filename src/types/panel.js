'use strict'

const BaseArgumentType = require('./base')

const { Panel } = require('../structures')

class PanelArgumentType extends BaseArgumentType {
  constructor (client) {
    super(client, Panel)
  }
}

module.exports = PanelArgumentType
