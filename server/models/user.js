'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.SessionToken, {
        foreignKey: 'userId',
        as: 'sessionTokens'
      });
      User.belongsTo(models.Team, {
        foreignKey: 'teamId',
        onDelete: 'CASCADE'
      });
    }
  }
  User.init({
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    teamPosition: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isPlayer: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    isMod: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};