'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Teams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,   
        allowNull: false
      },
      joinCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      roomId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Rooms',
          key: 'id',
          as: 'roomId'
        }
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
    await queryInterface.dropTable('Teams');
  }
};