const { Sequelize } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(
  process.env.DB_NAME || 'expense',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Dineshyuvi@12',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false 
      } : false
    }
  }
);

module.exports = sequelize;