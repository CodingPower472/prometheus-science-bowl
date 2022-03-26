'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ScoreboardHalfRow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ScoreboardHalfRow.belongsTo(models.GameRecord, {
        foreignKey: 'gameRecordId'
      });
      ScoreboardHalfRow.belongsTo(models.Team, {
        foreignKey: 'teamId'
      });
    }
  }
  ScoreboardHalfRow.init({
    gameRecordId: DataTypes.INTEGER,
    questionNum: DataTypes.INTEGER,
    score: DataTypes.INTEGER,
    whoBuzzedGID: DataTypes.STRING,
    teamId: DataTypes.INTEGER,
    isTeamA: DataTypes.BOOLEAN,
    isEmpty: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ScoreboardHalfRow',
  });
  return ScoreboardHalfRow;
};