
'use strict'
const lodash = require('lodash')

const { WSEvents } = require('../../../util/Constants')

const handlers = {}

for (const name of Object.keys(WSEvents)) {
  try {
    handlers[name] = require(`./${lodash.kebabCase(name)}.js`)
  } catch {} // eslint-disable-line no-empty
}

module.exports = handlers