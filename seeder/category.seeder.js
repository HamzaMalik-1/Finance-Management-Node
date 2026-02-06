import { Category } from "../models/index.js";
import logger from "../utils/logger.js";

const categories = [
  // --- PARENT INCOME CATEGORIES ---
  { id: 1, name: 'Salary', type: 'income', icon: 'wallet', color: '#2ECC71', isDefault: true, parentId: null },
  { id: 2, name: 'Freelance', type: 'income', icon: 'laptop', color: '#3498DB', isDefault: true, parentId: null },
  { id: 3, name: 'Investment', type: 'income', icon: 'trending-up', color: '#9B59B6', isDefault: true, parentId: null },

  // --- PARENT EXPENSE CATEGORIES ---
  { id: 4, name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#E67E22', isDefault: true, parentId: null },
  { id: 5, name: 'Transportation', type: 'expense', icon: 'car', color: '#34495E', isDefault: true, parentId: null },
  { id: 6, name: 'Housing', type: 'expense', icon: 'home', color: '#E74C3C', isDefault: true, parentId: null },
  { id: 7, name: 'Utilities', type: 'expense', icon: 'bolt', color: '#F1C40F', isDefault: true, parentId: null },

  // --- SUB-CATEGORIES (Linked by parentId) ---
  { id: 8, name: 'Groceries', type: 'expense', icon: 'shopping-basket', parentId: 4, isDefault: true },
  { id: 9, name: 'Restaurants', type: 'expense', icon: 'glass-cheers', parentId: 4, isDefault: true },
  { id: 10, name: 'Fuel', type: 'expense', icon: 'gas-pump', parentId: 5, isDefault: true },
  { id: 11, name: 'Rent', type: 'expense', icon: 'key', parentId: 6, isDefault: true },
  { id: 12, name: 'Electricity Bill', type: 'expense', icon: 'lightbulb', parentId: 7, isDefault: true }
];

const CategorySeeder = async () => {
  try {
    logger.info("🌱 Seeding System Categories...");
    let changesMade = false;

    for (const item of categories) {
      const [record, created] = await Category.findOrCreate({
        where: { id: item.id },
        defaults: item
      });

      if (created) {
        changesMade = true;
        logger.info(`✅ Created Category: ${record.name} (${record.type})`);
      } else {
        // Sync any updates to icon, color, or parentId
        let isUpdated = false;
        if (record.name !== item.name || record.parentId !== item.parentId || record.icon !== item.icon) {
          await record.update(item);
          isUpdated = true;
          changesMade = true;
        }
        if (isUpdated) logger.info(`🔄 Updated Category: ${record.name}`);
      }
    }

    if (!changesMade) {
      logger.info("ℹ️ Categories are already up to date.");
    }
  } catch (error) {
    logger.error(`❌ Error seeding categories: ${error.message}`);
  }
};

export default CategorySeeder;