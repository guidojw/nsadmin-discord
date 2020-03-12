'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class DeleteSuggestionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'deletesuggestion',
            aliases: ['delete'],
            description: 'Deletes your last suggested suggestion.',
            clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES']
        })
    }

    async execute (message, _args, guild) {
        const channels = guild.getData('channels')
        const guildMessages = guild.getData('messages')
        const channel = guild.guild.channels.get(channels.suggestionsChannel)
        const messages = await channel.fetchMessages()
        const authorUrl = `https://discordapp.com/users/${message.author.id}`
        for (const suggestion of messages.values()) {
            if (suggestion.embeds.length === 1 && suggestion.embeds[0].author.url === authorUrl && suggestion.id !==
                guildMessages.firstSsuggestionMessage) {
                const choice = await discordService.prompt(message.channel, message.author, await message.replyEmbed(
                    suggestion.embeds[0], 'Are you sure would like to delete this suggestion?'))
                if (choice) {
                    await suggestion.delete()
                    message.reply('Successfully deleted your last suggestion.')
                } else {
                    message.reply('Didn\'t delete your last suggestion.')
                }
                return
            }
        }
        message.reply('Could not find a suggestion you made.')
    }
}