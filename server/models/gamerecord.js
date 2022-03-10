'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GameRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GameRecord.hasMany(models.ScoreboardHalfRow, {
        foreignKey: 'gameRecordId',
        as: 'scoreboardHalfRows'
      });
      GameRecord.belongsTo(models.Room, {
        foreignKey: 'roomId'
      });
      GameRecord.belongsTo(models.Team, {
        foreignKey: 'teamAId'
      });
      GameRecord.belongsTo(models.Team, {
        foreignKey: 'teamBId'
      });
    }
  }
  GameRecord.init({
    roundNum: DataTypes.INTEGER,
    roomId: DataTypes.INTEGER,
    teamAId: DataTypes.INTEGER,
    teamBId: DataTypes.INTEGER,
    scoreA: DataTypes.INTEGER,
    scoreB: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GameRecord',
  });
  return GameRecord;
};