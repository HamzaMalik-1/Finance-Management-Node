import { Currency } from "../models/index.js";
import logger from "../utils/logger.js";

const currencies = [
  { id: 1, code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { id: 2, code: 'USD', name: 'US Dollar', symbol: '$' },
  { id: 3, code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { id: 4, code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { id: 5, code: 'GBP', name: 'British Pound', symbol: '£' },
  { id: 6, code: 'EUR', name: 'Euro', symbol: '€' },
  { id: 7, code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { id: 8, code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
];

const CurrencySeeder = async () => {
  try {
    logger.info("🌱 Seeding Currencies...");
    let changesMade = false;

    for (const data of currencies) {
      const [currency, created] = await Currency.findOrCreate({
        where: { code: data.code }, // Searching by code is safer for unique master data
        defaults: data
      });

      if (created) {
        changesMade = true;
        logger.info(`✅ Created Currency: ${currency.name} (${currency.code})`);
      } else {
        // Update if the name or symbol was changed in the seeder file
        if (currency.name !== data.name || currency.symbol !== data.symbol) {
          currency.name = data.name;
          currency.symbol = data.symbol;
          await currency.save();
          changesMade = true;
          logger.info(`🔄 Updated Currency: ${currency.code}`);
        }
      }
    }

    if (!changesMade) {
      logger.info("ℹ️ Currencies are already up to date.");
    }
  } catch (error) {
    logger.error(`❌ Error seeding currencies: ${error.message}`);
  }
};

export default CurrencySeeder;