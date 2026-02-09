import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class Debt extends BaseModel {}

  Debt.init({
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
    contactId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'contacts', key: 'id' }
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'accounts', key: 'id' },
      comment: "The account where the initial money was received or sent"
    },
    amount: { 
      type: DataTypes.DECIMAL(15, 2), 
      allowNull: false 
    },
    remainingAmount: { 
      type: DataTypes.DECIMAL(15, 2), 
      allowNull: false,
      comment: "Updated automatically as repayments are made"
    },
    type: { 
      type: DataTypes.ENUM('borrowed', 'lent'), 
      allowNull: false 
    },
    dueDate: { 
      type: DataTypes.DATEONLY, 
      allowNull: true 
    },
    interestRate: { 
      type: DataTypes.DECIMAL(5, 2), 
      defaultValue: 0.00 
    },
    status: { 
      type: DataTypes.ENUM('active', 'partially_paid', 'settled'), 
      defaultValue: 'active' 
    },
    description: { 
      type: DataTypes.TEXT 
    }
  }, {
    sequelize,
    modelName: "Debt",
    tableName: "debts",
    underscored: true,
    timestamps: true,
    paranoid: true
  });

Debt.addHook('afterCreate', async (debt, options) => {
  const { Transaction } = debt.sequelize.models;

  
  await Transaction.create({
    userId: debt.userId,
    accountId: debt.accountId,
    debtId: debt.id, // Link them
    amount: debt.amount,
    type: debt.type === 'borrowed' ? 'income' : 'expense',
    description: `Initial entry for debt: ${debt.description || debt.type}`,
    transactionDate: new Date(),
    status: 'completed'
  }, { transaction: options.transaction });
});
  return Debt;
};