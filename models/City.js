import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class City extends BaseModel {}

  City.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'countries', key: 'id' }
    }
  }, {
    sequelize,
    modelName: "City",
    tableName: "cities",
    underscored: true,
    timestamps: false
  });
  return City;
};