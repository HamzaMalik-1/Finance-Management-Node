import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class Account extends BaseModel {}

  Account.init({
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false // e.g., "HBL Savings", "Cash Wallet"
    },
    accountTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'account_types', key: 'id' }
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2), // Supports up to 99 trillion with 2 decimal places
      defaultValue: 0.00,
      allowNull: false
    },
    openingBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'currencies', key: 'id' }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    excludeFromStats: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // Helpful for hiding "Hidden" or "Test" accounts from charts
    }
  }, {
    sequelize,
    modelName: "Account",
    tableName: "accounts",
    underscored: true,
    timestamps: true,
    paranoid:true
  });
  return Account;
};