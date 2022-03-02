'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Team.hasMany(models.User, {
        foreignKey: 'teamId',
        as: 'members'
      });
      Team.belongsTo(models.Room, {
        foreignKey: 'roomId'
      })
    }
  }
  Team.init({
    name: DataTypes.STRING,
    joinCode: DataTypes.STRING,
    roomId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};