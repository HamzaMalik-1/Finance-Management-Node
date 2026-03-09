import { DataTypes, Op } from "sequelize"; // Added Op for date comparisons
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
      toAccountId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "accounts", key: "id" },
      },
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
      exchangeRate: { type: DataTypes.DECIMAL(10, 6), defaultValue: 1.0 },
      feeAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.0 },
      isRecurring: { type: DataTypes.BOOLEAN, defaultValue: false },
      recurringPeriod: {
        type: DataTypes.ENUM("daily", "weekly", "monthly", "yearly"),
        allowNull: true,
      },
      balanceAfter: { type: DataTypes.DECIMAL(15, 2) },
      referenceId: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "Transaction",
      tableName: "transactions",
      underscored: true,
      timestamps: true,
    },
  );

  // --- HOOK: AFTER UPDATE ---
  Transaction.addHook("afterUpdate", async (transaction, options) => {
    if (!transaction.changed("status")) return;

    const { Account } = transaction.sequelize.models;
    const previousStatus = transaction.previous("status");
    const currentStatus = transaction.status;
    const { accountId, amount, type, feeAmount } = transaction;

    const account = await Account.findByPk(accountId, {
      transaction: options.transaction,
    });
    
    let newBalance = parseFloat(account.balance);
    const totalValue = parseFloat(amount) + parseFloat(feeAmount || 0);

    if (previousStatus !== "completed" && currentStatus === "completed") {
      if (type === "expense" || type === "transfer") newBalance -= totalValue;
      if (type === "income") newBalance += parseFloat(amount);
    }
    else if (previousStatus === "completed" && currentStatus !== "completed") {
      if (type === "expense" || type === "transfer") newBalance += totalValue;
      if (type === "income") newBalance -= parseFloat(amount);
    }

    await account.update(
      { balance: newBalance },
      { transaction: options.transaction },
    );

    transaction.balanceAfter = newBalance;
    await transaction.save({ transaction: options.transaction, hooks: false });
  });

  // --- HOOK: AFTER CREATE ---
  Transaction.addHook("afterCreate", async (transaction, options) => {
    const { Account, Debt, Notification, Budget, Category } = transaction.sequelize.models;
    const { 
        accountId, toAccountId, amount, type, feeAmount, 
        debtId, userId, description, categoryId, transactionDate 
    } = transaction;

    // 1. HANDLE SOURCE ACCOUNT BALANCE
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

    transaction.balanceAfter = newBalance;
    await transaction.save({ transaction: options.transaction, hooks: false });

    // 2. HANDLE TRANSFER DESTINATION
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

    // 3. HANDLE DEBT REPAYMENT
    if (debtId) {
      if (description && description.includes('[Initial]')) {
        return; 
      }

      const debt = await Debt.findByPk(debtId, {
        transaction: options.transaction,
      });

      if (debt) {
        let newRemaining = parseFloat(debt.remainingAmount) - parseFloat(amount);
        if (newRemaining < 0) newRemaining = 0;

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

        if (newStatus === "settled") {
          await Notification.create({
            userId: userId,
            type: "debt_settled",
            message: `Success! Your debt related to "${debt.description || 'loan'}" has been fully settled.`,
          }, { transaction: options.transaction });
        }
      }
    }

    // 4. HANDLE BUDGET TRACKING
    if (type === "expense" && categoryId) {
      const targetDate = transactionDate || new Date();
      
      const activeBudget = await Budget.findOne({
        where: {
          userId,
          categoryId,
          isActive: true,
          startDate: { [Op.lte]: targetDate },
          endDate: { [Op.gte]: targetDate }
        },
        include: [{ model: Category, as: 'category', attributes: ['name'] }],
        transaction: options.transaction
      });

      if (activeBudget) {
        const spentAmount = parseFloat(amount);
        const newActualSpent = parseFloat(activeBudget.actualSpent || 0) + spentAmount;
        const limit = parseFloat(activeBudget.amountLimit);
        const threshold = parseFloat(activeBudget.alertThreshold || 80);

        await activeBudget.update({
          actualSpent: newActualSpent
        }, { transaction: options.transaction });

        const usagePercentage = (newActualSpent / limit) * 100;
        const catName = activeBudget.category?.name || 'Category';

        if (usagePercentage >= 100) {
          await Notification.create({
            userId,
            type: 'budget_exceeded',
            message: `🚨 Budget Exceeded: You've spent $${newActualSpent.toLocaleString()} on ${catName}, surpassing your $${limit.toLocaleString()} limit.`,
          }, { transaction: options.transaction });
        } else if (usagePercentage >= threshold) {
          await Notification.create({
            userId,
            type: 'budget_warning',
            message: `⚠️ Budget Warning: You've used ${usagePercentage.toFixed(0)}% of your $${limit.toLocaleString()} budget for ${catName}.`,
          }, { transaction: options.transaction });
        }
      }
    }
  });

  return Transaction;
};