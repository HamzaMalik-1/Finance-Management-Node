const UserModel = require('./User');
const { sequelize } = require('../config/db'); // adjust path as needed

const User = UserModel(sequelize); // ← important: call it with sequelize instance





module.exports = {
  User,
  Category,
  Product
};
