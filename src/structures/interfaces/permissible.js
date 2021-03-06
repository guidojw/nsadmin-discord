'use strict'

const PermissionManager = require('../../managers/permission')

class Permissible {
  constructor () {
    this.aroraPermissions = new PermissionManager(this)
  }

  permissionFor (commandOrGroup, bypassGroup) {
    const commandPermission = this.aroraPermissions.resolve(commandOrGroup)?.allow ?? null
    const groupPermission = this.aroraPermissions.resolve(commandOrGroup.group)?.allow ?? null
    return (bypassGroup || commandPermission === groupPermission)
      ? commandPermission
      : commandPermission !== false && groupPermission !== false
  }

  static applyToClass (structure) {
    const props = ['permissionFor']
    for (const prop of props) {
      Object.defineProperty(
        structure.prototype,
        prop,
        Object.getOwnPropertyDescriptor(Permissible.prototype, prop)
      )
    }
  }
}

module.exports = Permissible
