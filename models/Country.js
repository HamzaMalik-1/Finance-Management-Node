import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class Country extends BaseModel {}

  Country.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    isoCode: { type: DataTypes.STRING(2), unique: true, allowNull: false }, // e.g., PK, US
    name: { type: DataTypes.STRING, allowNull: false },
    phoneCode: { type: DataTypes.STRING(10) } // e.g., +92, +1
  }, {
    sequelize,
    modelName: "Country",
    tableName: "countries",
    underscored: true,
    timestamps: false
  });
  return Country;
};