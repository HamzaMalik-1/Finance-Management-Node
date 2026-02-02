import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class UserContact extends BaseModel {}

  UserContact.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    phoneNumber: { 
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true // Prevent duplicate numbers across accounts
    },
    isPrimary: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: "UserContact",
    tableName: "user_contacts",
    underscored: true
  });
  return UserContact;
};