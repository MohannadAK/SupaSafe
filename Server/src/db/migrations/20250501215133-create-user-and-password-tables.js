'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      hashedPass: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      salt: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      encryptedDEK: {
        type: Sequelize.STRING(44),
        allowNull: false
      },
      dekIV: {
        type: Sequelize.STRING(32),
        allowNull: false
      },
      lastUpdate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      creationDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      keyCreationDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.createTable('passwords', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      iv: {
        type: Sequelize.STRING(24),
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      encryptedPass: {
        type: Sequelize.STRING(44),
        allowNull: false
      },
      siteName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      lastUpdate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      creationDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      websiteUrl: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('passwords');
    await queryInterface.dropTable('users');
  }
};