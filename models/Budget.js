import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class Budget extends BaseModel {}

  Budget.init({
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
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Budgets are almost always category-specific
      references: { model: 'categories', key: 'id' }
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'currencies', key: 'id' }
    },
    amountLimit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    actualSpent: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    period: {
      type: DataTypes.ENUM('weekly', 'monthly', 'yearly', 'custom'),
      defaultValue: 'monthly'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    // alertThreshold: Percentage (e.g., 80 for 80%) to trigger a notification
    alertThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 80 
    },
    // isRolling: If true, leftover budget carries over to the next period
    isRolling: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: "Budget",
    tableName: "budgets",
    underscored: true,
    timestamps: true,
    paranoid:true
  });

  return Budget;
};