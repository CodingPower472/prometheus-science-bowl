'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ScoreboardHalfRows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      gameRecordId: {
        type: Sequelize.INTEGER,,
        allowNull: false,
        references: {
          model: 'GameRecords',
          key: 'id',
          as: 'gameRecordId'
        }
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      whoBuzzedGID: {
        type: Sequelize.STRING,
        allowNull: true
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'id',
          as: 'teamId'
        }
      },
      isTeamA: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      isEmpty: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ScoreboardHalfRows');
  }
};