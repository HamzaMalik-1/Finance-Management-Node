import { AccountType } from "../models/index.js";
import logger from "../utils/logger.js";

const accountTypes = [
  { 
    id: 1, 
    name: 'Bank Account', 
    slug: 'bank-account', 
    description: 'Standard savings or current accounts at a formal banking institution.' 
  },
  { 
    id: 2, 
    name: 'Credit Card', 
    slug: 'credit-card', 
    description: 'Credit facilities with a set limit.' 
  },
  { 
    id: 3, 
    name: 'Cash Wallet', 
    slug: 'cash-wallet', 
    description: 'Physical cash held on hand for daily expenses.' 
  },
  { 
    id: 4, 
    name: 'Mobile Wallet', 
    slug: 'mobile-wallet', 
    description: 'Digital wallets like Easypaisa, JazzCash, or PayPal.' 
  },
  { 
    id: 5, 
    name: 'Investment Account', 
    slug: 'investment-account', 
    description: 'Brokerage accounts, stocks, or mutual fund holdings.' 
  },
  { 
    id: 6, 
    name: 'Loan/Debt', 
    slug: 'loan-debt', 
    description: 'Accounts representing money owed to others.' 
  }
];

const AccountTypeSeeder = async () => {
  try {
    logger.info("🌱 Seeding Account Types...");
    let changesMade = false;

    for (const item of accountTypes) {
      const [record, created] = await AccountType.findOrCreate({
        where: { slug: item.slug }, // Slug is unique and stable
        defaults: item
      });

      if (created) {
        changesMade = true;
        logger.info(`✅ Created Account Type: ${record.name}`);
      } else {
        // Update name or description if they changed in the seeder file
        if (record.name !== item.name || record.description !== item.description) {
          await record.update({
            name: item.name,
            description: item.description
          });
          changesMade = true;
          logger.info(`🔄 Updated Account Type: ${record.slug}`);
        }
      }
    }

    if (!changesMade) {
      logger.info("ℹ️ Account Types are already up to date.");
    }
  } catch (error) {
    logger.error(`❌ Error seeding account types: ${error.message}`);
  }
};

export default AccountTypeSeeder;