'use strict'

const commandStatusChangeHandler = (client, guild, command, enabled) => {
  client.provider.onCommandStatusChange('command', guild, command, enabled)
}

module.exports = commandStatusChangeHandler
