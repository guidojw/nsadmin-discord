'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('guilds', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      primaryColor: {
        type: Sequelize.INTEGER,
        field: 'primary_color'
      },
      supportEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'support_enabled'
      },
      logsChannelId: {
        type: Sequelize.STRING,
        field: 'log_channel_id'
      },
      trainingsChannelId: {
        type: Sequelize.STRING,
        field: 'trainings_channel_id'
      },
      suggestionsChannelId: {
        type: Sequelize.STRING,
        field: 'suggestions_channel_id'
      },
      ratingsChannelId: {
        type: Sequelize.STRING,
        field: 'ratings_channel_id'
      },
      supportChannelId: {
        type: Sequelize.STRING,
        field: 'support_channel_id'
      },
      trainingsMessageId: {
        type: Sequelize.STRING,
        field: 'trainings_message_id'
      },
      trainingsIngfoMessageId: {
        type: Sequelize.STRING,
        field: 'trainings_info_message_id'
      },
      supportMessageId: {
        type: Sequelize.STRING,
        field: 'support_message_id'
      }
    })

    await queryInterface.createTable('guilds_commands', {
      commandName: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'command_name'
      },
      guildId: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    })

    await queryInterface.createTable('tags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      authorId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'author_id'
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false
      }
    })

    await queryInterface.createTable('tag_names', {
      name: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      tagId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'tags',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'tag_id'
      }
    })

    await queryInterface.createTable('tickets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      authorId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'author_id'
      },
      channelId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'channel_id'
      }
    })

    await queryInterface.createTable('tickets_moderators', {
      userId: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'user_id'
      },
      ticketId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'tickets',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'ticket_id'
      }
    })

    await queryInterface.createTable('role_bindings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      roleId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'role_id'
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      min: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      max: Sequelize.INTEGER
    })

    await queryInterface.createTable('users_roles', {
      userId: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'user_id'
      },
      roleId: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'role_id'
      },
      guildId: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('channels_channels', {
      channel1_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'channel1_id'
      },
      channel2_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'channel2_id'
      },
      guildId: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('channel_groups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('channels_channel_groups', {
      channelId: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'channel_id'
      },
      channelGroupId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'channel_groups',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'channel_group_id'
      }
    })

    await queryInterface.createTable('role_groups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('roles_role_groups', {
      roleId: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'role_id'
      },
      roleGroupId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'role_groups',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'role_group_id'
      }
    })
  },

  down: async (queryInterface /* , Sequelize */) => {
    await queryInterface.dropTable('roles_role_groups')
    await queryInterface.dropTable('role_groups')

    await queryInterface.dropTable('channels_channel_groups')
    await queryInterface.dropTable('channel_groups')

    await queryInterface.dropTable('channels_channels')

    await queryInterface.dropTable('users_roles')
    await queryInterface.dropTable('role_bindings')

    await queryInterface.dropTable('tickets_moderators')
    await queryInterface.dropTable('tickets')

    await queryInterface.dropTable('tag_names')
    await queryInterface.dropTable('tags')

    await queryInterface.dropTable('guilds_commands')
    await queryInterface.dropTable('guilds')
  }
}
