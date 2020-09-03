'use strict'
const Command = require('../../controllers/command')

module.exports = class BlockSupportCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'tickets',
            name: 'blocksupport',
            aliases: ['block'],
            description: 'Blocks someone from making tickets in the ticket system.',
            examples: ['blocksupport Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            adminOnly: true,
            args: [
                {
                    key: 'member',
                    type: 'member',
                    prompt: 'Who would you like to block?'
                }
            ]
        })
    }

    async execute (message, { member }, guild) {
        const username = member.displayName
        const role = guild.getData('roles').ticketsBannedRole

        if (member.roles.cache.has(role)) {
            await message.reply('Member is already blocked.')
        } else {
            member.roles.add(role)
            await message.reply(`Successfully blocked **${username}**.`)
        }
    }
}