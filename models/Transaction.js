import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class Transaction extends BaseModel {}

  Transaction.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    accountId: { type: DataTypes.UUID, allowNull: false, references: { model: 'accounts', key: 'id' } },
    categoryId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'categories', key: 'id' } },
    
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    type: { type: DataTypes.ENUM('income', 'expense', 'transfer'), allowNull: false },
    description: { type: DataTypes.TEXT },
    transactionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    
    // For Transfers (Money moving between two of the same user's accounts)
    toAccountId: { type: DataTypes.UUID, allowNull: true, references: { model: 'accounts', key: 'id' } },
    
    attachmentPath: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('pending', 'completed', 'cancelled'), defaultValue: 'completed' },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    
    // Advanced Financial Tracking
    exchangeRate: { type: DataTypes.DECIMAL(10, 6), defaultValue: 1.000000 },
    feeAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
    
    // Recurring Logic
    isRecurring: { type: DataTypes.BOOLEAN, defaultValue: false },
    recurringPeriod: { type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'), allowNull: true },
    
    // Audit Fields
    balanceAfter: { type: DataTypes.DECIMAL(15, 2) }, // Balance of the account after this transaction
    referenceId: { type: DataTypes.STRING } // For external IDs (Bank SMS ID, Gateway ID)
  }, {
    sequelize,
    modelName: "Transaction",
    tableName: "transactions",
    underscored: true,
    timestamps: true
  });

  return Transaction;
};