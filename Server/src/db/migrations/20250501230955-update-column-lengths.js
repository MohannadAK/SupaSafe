'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update the encryptedDEK column to use TEXT instead of STRING(44)
    // Base64 encoded encrypted data can be quite long
    await queryInterface.changeColumn('users', 'encryptedDEK', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    // Update the dekIV column to be longer - Base64 encoded IVs can be longer than 32 chars
    await queryInterface.changeColumn('users', 'dekIV', {
      type: Sequelize.STRING(64),
      allowNull: false
    });

    // Ensure the salt column is long enough for Base64 encoded random data
    await queryInterface.changeColumn('users', 'salt', {
      type: Sequelize.STRING(64),
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes
    await queryInterface.changeColumn('users', 'encryptedDEK', {
      type: Sequelize.STRING(44),
      allowNull: false
    });

    await queryInterface.changeColumn('users', 'dekIV', {
      type: Sequelize.STRING(32),
      allowNull: false
    });

    await queryInterface.changeColumn('users', 'salt', {
      type: Sequelize.STRING(60),
      allowNull: false
    });
  }
};