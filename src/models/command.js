'use strict'

module.exports = (sequelize, DataTypes) => {
  const Command = sequelize.define('Command', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['command', 'group']
    }
  }, {
    tableName: 'commands'
  })

  Command.associate = models => {
    Command.belongsToMany(models.Guild, {
      through: models.GuildCommand,
      foreignKey: 'commandId',
      otherKey: 'guildId'
    })
    Command.hasMany(models.Permission, {
      foreignKey: {
        name: 'commandId',
        allowNull: false
      }
    })
  }

  return Command
}
