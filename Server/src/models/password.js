const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Password extends Model {
        static associate(models) {
            // define association here
            Password.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
        }
    }

    Password.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        iv: {
            type: DataTypes.STRING(24),
            allowNull: false
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        encryptedPass: {
            type: DataTypes.STRING(44),
            allowNull: false
        },
        siteName: {
            type: DataTypes.STRING(100),
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
        websiteUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Password',
        tableName: 'passwords',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['userId', 'username'],
                name: 'unique_user_username'
            }
        ]
    });

    return Password;
};