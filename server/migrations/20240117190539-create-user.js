'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      googleId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      teamId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Teams',
          key: 'id',
          as: 'teamId'
        }
      },
      teamPosition: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      roomId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isPlayer: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      isMod: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      isAdmin: {
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
    await queryInterface.dropTable('Users');
  }
};