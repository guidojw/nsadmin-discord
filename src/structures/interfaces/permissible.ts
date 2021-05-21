import { Command, CommandGroup } from 'discord.js-commando'
import BaseStructure from '../base'
import PermissionManager from '../../managers/permission'

export default class Permissible {
  readonly aroraPermissions: PermissionManager

  constructor () {
    this.aroraPermissions = new PermissionManager(this)
  }

  permissionFor (commandOrGroup: Command | CommandGroup, bypassGroup: boolean): boolean {
    const commandPermission = this.aroraPermissions.resolve(commandOrGroup)?.allow ?? null
    const groupPermission = this.aroraPermissions.resolve(commandOrGroup instanceof Command
      ? commandOrGroup.group
      : undefined
    )?.allow ?? null
    return (bypassGroup || commandPermission === groupPermission)
      ? commandPermission
      : commandPermission !== false && groupPermission !== false
  }

  static applyToClass (structure: BaseStructure): void {
    const props = ['permissionFor']
    for (const prop of props) {
      Object.defineProperty(
        // @ts-expect-error
        structure.prototype,
        prop,
        Object.getOwnPropertyDescriptor(Permissible.prototype, prop) as PropertyDescriptor
      )
    }
  }
}
