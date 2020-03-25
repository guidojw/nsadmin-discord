'use strict'
require('dotenv').config()

const path = require('path')
const Guild = require('./guild')
const Commando = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const SettingProvider = require('./setting-provider')
const { stripIndents } = require('common-tags')

const applicationConfig = require('../../config/application')

module.exports = class Bot {
    constructor () {
        this.client = new Commando.Client({
            commandPrefix: applicationConfig.defaultPrefix,
            owner: applicationConfig.owner,
            unknownCommandResponse: false,
            disableEveryone: true,
            partias: ['MESSAGE', 'GUILD_MEMBER']
        })
        this.client.bot = this
        this.currentActivity = 0
        this.client.setProvider(new SettingProvider())

        this.client.registry
            .registerGroup('admin', 'Admin')
            .registerGroup('main', 'Main')
            .registerGroup('miscellaneous', 'Miscellaneous')
            .registerGroup('bot', 'Bot')
            .registerDefaultGroups()
            .registerDefaultTypes()
            .registerDefaultCommands({
                commandState: true,
                unknownCommand: false,
                ping: true,
                help: true,
                eval: true,
                prefix: true
            })
            .registerCommandsIn(path.join(__dirname, '../commands'))

        this.guilds = {}

        this.client.once('ready', this.ready.bind(this))
        this.client.on('guildMemberAdd', this.guildMemberAdd.bind(this))
        this.client.on('commandRun', this.commandRun.bind(this))

        this.client.login(process.env.DISCORD_TOKEN)
    }

    async fetch () {
        for (const guildId of this.client.guilds.cache.keys()) {
            this.guilds[guildId] = new Guild(this, guildId)
            await this.guilds[guildId].loadData()
        }
    }

    setActivity (name, options) {
        if (!name) {
            const activity = this.getNextActivity()
            name = activity.name
            options = activity.options
        }
        this.client.user.setActivity(name, options)
    }

    ready () {
        this.fetch()
        console.log(`Ready to serve on ${this.client.guilds.cache.size} servers, for ${this.client.users.cache.size} ` +
            'users.')
        this.setActivity()
        setInterval(() => this.setActivity(), 60 * 1000)
    }

    async guildMemberAdd (member) {
        if (member.partial) await member.fetch()
        if (member.user.bot) return
        const embed = new MessageEmbed()
            .setTitle(`Hey ${member.user.tag},`)
            .setDescription(`You're the **${member.guild.memberCount}th** member on **${member.guild.name}**!`)
            .setThumbnail(member.user.displayAvatarURL())
        const guild = this.guilds[member.guild.id]
        guild.guild.channels.cache.get(guild.getData('channels').welcomeChannel).send(embed)
    }

    async commandRun (command, promise, message) {
        if (!message.guild) return
        await promise
        const embed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(stripIndents`${message.author} **used** \`${command.name}\` **command in** ${message
                .channel} [Jump to Message](${message.url})
                ${message.content}`)
        const guild = this.guilds[message.guild.id]
        guild.guild.channels.cache.get(guild.getData('channels').logsChannel).send(embed)
    }

    getNextActivity () {
        this.currentActivity++
        if (this.currentActivity === 3) this.currentActivity = 0
        switch (this.currentActivity) {
            case 0:
                return { name: `${this.client.commandPrefix}help`, options: { type: 'LISTENING' }}
            case 1:
                return { name: 'Project Railrunner', options: { type: 'PLAYING' }}
            case 2: {
                let totalMemberCount = 0
                for (const guild of Object.values(this.guilds)) {
                    totalMemberCount += guild.guild.memberCount
                }
                return { name: `${totalMemberCount} users`, options: { type: 'WATCHING' }}
            }
        }
    }
}
