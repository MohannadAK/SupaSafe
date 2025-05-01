const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Define associations here (if any, like a one-to-many or many-to-many relationship)
      // For example:
      // User.hasMany(models.Post);
    }
  }

  User.init(
    {
      // Define your attributes (columns) here
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Add any other fields (e.g., first_name, last_name, etc.)
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users', // You can specify the table name if you don't want Sequelize to pluralize
      timestamps: true,   // Adds `createdAt` and `updatedAt` automatically
    }
  );

  return User;
};
