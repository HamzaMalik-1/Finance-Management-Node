import cron from 'node-cron';
import { Transaction, sequelize } from '../models/index.js';
import moment from 'moment';

// Runs every day at 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('⏳ Checking for recurring transactions...');
  
  const recurring = await Transaction.findAll({ where: { isRecurring: true, status: 'completed' } });

  for (const tx of recurring) {
    const today = moment();
    const lastDate = moment(tx.transactionDate);
    let shouldRepeat = false;

    if (tx.recurringPeriod === 'daily' && today.diff(lastDate, 'days') >= 1) shouldRepeat = true;
    if (tx.recurringPeriod === 'weekly' && today.diff(lastDate, 'weeks') >= 1) shouldRepeat = true;
    if (tx.recurringPeriod === 'monthly' && today.diff(lastDate, 'months') >= 1) shouldRepeat = true;

    if (shouldRepeat) {
      await sequelize.transaction(async (t) => {
        const newTx = tx.toJSON();
        delete newTx.id; // Let UUID generate new
        newTx.transactionDate = new Date();
        await Transaction.create(newTx, { transaction: t });
      });
    }
  }
});