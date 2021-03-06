'use strict'

module.exports = (sequelize, DataTypes) => {
  const TicketType = sequelize.define('TicketType', {
    name: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    emoji: {
      type: DataTypes.STRING(7),
      defaultValue: null,
      validate: { emojiNandEmojiId }
    }
  }, {
    hooks: {
      beforeUpdate: async (ticketType, { channelId }) => {
        if (ticketType.changed('messageId') && ticketType.messageId) {
          await sequelize.models.Message.findOrCreate({
            where: {
              id: ticketType.messageId,
              guildId: ticketType.guildId,
              channelId
            }
          })
        }
        if (ticketType.changed('emojiId') && ticketType.emojiId) {
          await sequelize.models.Emoji.findOrCreate({
            where: {
              id: ticketType.emojiId,
              guildId: ticketType.guildId
            }
          })
        }
      }
    },
    tableName: 'ticket_types'
  })

  TicketType.associate = models => {
    TicketType.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    TicketType.belongsTo(models.Emoji, {
      foreignKey: {
        name: 'emojiId',
        defaultValue: null,
        validate: { emojiNandEmojiId }
      },
      onDelete: 'SET NULL'
    })
    TicketType.belongsTo(models.Message, {
      foreignKey: 'messageId',
      as: 'message',
      onDelete: 'SET NULL'
    })
    TicketType.hasMany(models.Ticket, {
      foreignKey: 'typeId'
    })
  }

  TicketType.loadScopes = models => {
    TicketType.addScope('defaultScope', {
      include: [{
        model: models.Message,
        as: 'message'
      }]
    })
  }

  return TicketType
}

function emojiNandEmojiId () {
  if (this.emoji !== null && this.emojiId !== null) {
    throw new Error('Only one of emoji and emojiId or none can be set.')
  }
}
