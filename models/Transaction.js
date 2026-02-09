import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class Transaction extends BaseModel {}

  Transaction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "accounts", key: "id" },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "categories", key: "id" },
      },

      amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      type: {
        type: DataTypes.ENUM("income", "expense", "transfer"),
        allowNull: false,
      },
      description: { type: DataTypes.TEXT },
      transactionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

      // For Transfers (Money moving between two of the same user's accounts)
      toAccountId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "accounts", key: "id" },
      },
      // In transactions model addition:
      debtId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "debts", key: "id" },
        onDelete: "SET NULL",
      },

      attachmentPath: { type: DataTypes.STRING },
      status: {
        type: DataTypes.ENUM("pending", "completed", "cancelled"),
        defaultValue: "completed",
      },
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },

      // Advanced Financial Tracking
      exchangeRate: { type: DataTypes.DECIMAL(10, 6), defaultValue: 1.0 },
      feeAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.0 },

      // Recurring Logic
      isRecurring: { type: DataTypes.BOOLEAN, defaultValue: false },
      recurringPeriod: {
        type: DataTypes.ENUM("daily", "weekly", "monthly", "yearly"),
        allowNull: true,
      },

      // Audit Fields
      balanceAfter: { type: DataTypes.DECIMAL(15, 2) }, // Balance of the account after this transaction
      referenceId: { type: DataTypes.STRING }, // For external IDs (Bank SMS ID, Gateway ID)
    },
    {
      sequelize,
      modelName: "Transaction",
      tableName: "transactions",
      underscored: true,
      timestamps: true,
    },
  );

  // Inside Transaction model (add this after Transaction.init)
  Transaction.addHook("afterUpdate", async (transaction, options) => {
    // Only trigger if status has changed
    if (!transaction.changed("status")) return;

    const { Account } = transaction.sequelize.models;
    const previousStatus = transaction.previous("status");
    const currentStatus = transaction.status;
    const { accountId, toAccountId, amount, type, feeAmount } = transaction;

    const account = await Account.findByPk(accountId, {
      transaction: options.transaction,
    });
    let newBalance = parseFloat(account.balance);
    const totalValue = parseFloat(amount) + parseFloat(feeAmount || 0);

    // Logic: If moving TO completed, deduct/add money
    if (previousStatus !== "completed" && currentStatus === "completed") {
      if (type === "expense" || type === "transfer") newBalance -= totalValue;
      if (type === "income") newBalance += parseFloat(amount);
    }
    // Logic: If moving FROM completed to anything else, reverse the money
    else if (previousStatus === "completed" && currentStatus !== "completed") {
      if (type === "expense" || type === "transfer") newBalance += totalValue;
      if (type === "income") newBalance -= parseFloat(amount);
    }

    await account.update(
      { balance: newBalance },
      { transaction: options.transaction },
    );

    // Update balanceAfter for audit trail
    transaction.balanceAfter = newBalance;
    await transaction.save({ transaction: options.transaction, hooks: false });
  });
  // Inside Transaction model (add this after Transaction.init)
  Transaction.addHook("afterCreate", async (transaction, options) => {
  const { Account, Debt, Notification } = transaction.sequelize.models;
  const { accountId, toAccountId, amount, type, feeAmount, debtId, userId } = transaction;

  // --- 1. HANDLE SOURCE ACCOUNT BALANCE ---
  const account = await Account.findByPk(accountId, {
    transaction: options.transaction,
  });

  if (!account) throw new Error("Account not found");

  let newBalance = parseFloat(account.balance);
  const totalValue = parseFloat(amount) + parseFloat(feeAmount || 0);

  if (type === "expense" || type === "transfer") {
    newBalance -= totalValue;
  } else if (type === "income") {
    newBalance += parseFloat(amount);
  }

  await account.update(
    { balance: newBalance },
    { transaction: options.transaction }
  );

  // Update transaction audit field without re-triggering hooks
  transaction.balanceAfter = newBalance;
  await transaction.save({ transaction: options.transaction, hooks: false });

  // --- 2. HANDLE TRANSFER DESTINATION ---
  if (type === "transfer" && toAccountId) {
    const toAccount = await Account.findByPk(toAccountId, {
      transaction: options.transaction,
    });
    if (toAccount) {
      const toNewBalance = parseFloat(toAccount.balance) + parseFloat(amount);
      await toAccount.update(
        { balance: toNewBalance },
        { transaction: options.transaction }
      );
    }
  }

  // --- 3. HANDLE DEBT REPAYMENT ---
  if (debtId) {
    const debt = await Debt.findByPk(debtId, {
      transaction: options.transaction,
    });

    if (debt) {
      // Calculate new remaining amount (preventing negative values)
      let newRemaining = parseFloat(debt.remainingAmount) - parseFloat(amount);
      if (newRemaining < 0) newRemaining = 0;

      // Update Debt Status
      let newStatus = "partially_paid";
      if (newRemaining === 0) {
        newStatus = "settled";
      }

      await debt.update(
        {
          remainingAmount: newRemaining,
          status: newStatus,
        },
        { transaction: options.transaction }
      );

      // Notify user if the debt is fully paid
      if (newStatus === "settled") {
        await Notification.create({
          userId: userId,
          type: "debt_settled",
          message: `Success! Your debt related to "${debt.description || 'loan'}" has been fully settled.`,
        }, { transaction: options.transaction });
      }
    }
  }
});

  return Transaction;
};
