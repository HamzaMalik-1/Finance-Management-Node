import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class UserSettings extends BaseModel {}

  UserSettings.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    baseCurrencyId: { type: DataTypes.INTEGER, allowNull: false,}, // Default to PKR/USD
    profilePicture: { type: DataTypes.STRING, allowNull: true },
    languageId: { type: DataTypes.INTEGER, defaultValue: 1 },
    themePreference: { 
      type: DataTypes.ENUM('light', 'dark', 'system'), 
      defaultValue: 'system' 
    }
  }, {
    sequelize,
    modelName: "UserSettings",
    tableName: "user_settings",
    underscored: true
  });
  return UserSettings;
};