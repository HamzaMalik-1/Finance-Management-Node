import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class AccountType extends BaseModel {}

  AccountType.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true // e.g., "Bank Account", "Credit Card"
    },
    slug: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true // e.g., "bank-account", "credit-card"
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    }
  }, {
    sequelize,
    modelName: "AccountType",
    tableName: "account_types",
    underscored: true,
    timestamps: false // Master lookup data rarely changes
  });

  return AccountType;
};