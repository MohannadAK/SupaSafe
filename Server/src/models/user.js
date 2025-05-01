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
      type: DataTypes.STRING(60),
      allowNull: false
    },
    encryptedDEK: {
      type: DataTypes.STRING(44),
      allowNull: false
    },
    dekIV: {
      type: DataTypes.STRING(32), // Increased from 24 to 32
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
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  });

  return User;
};