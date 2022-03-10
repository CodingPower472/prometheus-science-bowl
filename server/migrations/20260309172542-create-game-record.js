'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GameRecords', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      roundNum: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      roomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Rooms',
            key: 'id',
            as: 'roomId'
        }
      },
      teamAId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'id',
          as: 'teamAId'
        }
      },
      teamBId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'id',
          as: 'teamBId'
        }
      },
      scoreA: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      scoreB: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('GameRecords');
  }
};