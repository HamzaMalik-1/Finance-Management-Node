
import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

// Address.js

export default (sequelize) => {
  class Address extends BaseModel {}
  Address.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    countryId: { type: DataTypes.INTEGER, allowNull: false },
    cityId: { type: DataTypes.INTEGER, allowNull: false },
    addressLine: { type: DataTypes.TEXT, allowNull: false }
  }, { sequelize, modelName: "Address", tableName: "addresses", underscored: true });
  return Address;
};
