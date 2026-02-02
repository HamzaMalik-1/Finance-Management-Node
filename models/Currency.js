import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class Currency extends BaseModel {}

  Currency.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(3), unique: true, allowNull: false }, // e.g., PKR, USD
    name: { type: DataTypes.STRING, allowNull: false },
    symbol: { type: DataTypes.STRING(10), allowNull: false } // e.g., ₨, $
  }, {
    sequelize,
    modelName: "Currency",
    tableName: "currencies",
    underscored: true,
    timestamps: false // Master data usually doesn't need timestamps
  });
  return Currency;
};