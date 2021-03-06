'use strict'

module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    content: {
      type: DataTypes.STRING(7000), // 6000 for embed character limit + 1000 margin for JSON characters
      allowNull: false
    }
  }, {
    tableName: 'tags'
  })

  Tag.associate = models => {
    Tag.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Tag.hasMany(models.TagName, {
      foreignKey: {
        name: 'tagId',
        primaryKey: true
      },
      as: 'names'
    })
  }

  Tag.loadScopes = models => {
    Tag.addScope('defaultScope', {
      include: [{
        model: models.TagName,
        as: 'names'
      }]
    })
  }

  return Tag
}
