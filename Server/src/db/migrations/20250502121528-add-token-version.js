'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add tokenVersion column to users table
    await queryInterface.addColumn('users', 'tokenVersion', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'tokenVersion');
  }
};