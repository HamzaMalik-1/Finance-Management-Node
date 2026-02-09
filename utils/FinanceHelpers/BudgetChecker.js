import { Budget, Notification } from '../../models/index.js';

export const checkBudgetThreshold = async (userId, categoryId, transaction) => {
  const budget = await Budget.findOne({ 
    where: { userId, categoryId, isActive: true } 
  });

  if (!budget) return;

  // Update actualSpent
  budget.actualSpent = parseFloat(budget.actualSpent) + parseFloat(transaction.amount);
  await budget.save();

  const usagePercent = (budget.actualSpent / budget.amountLimit) * 100;

  if (usagePercent >= budget.alertThreshold) {
    await Notification.create({
      userId,
      type: 'budget_alert',
      message: `Warning: You have used ${usagePercent.toFixed(1)}% of your budget for this category.`,
      link: `/budgets/${budget.id}`
    });
  }
};