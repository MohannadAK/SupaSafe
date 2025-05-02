const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Password, {
        foreignKey: 'userId',
        as: 'passwords'
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    hashedPass: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    encryptedDEK: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dekIV: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    lastUpdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    creationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    keyCreationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    // Add token version to track password changes
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  });

  return User;
};