import { sequelize } from "../../config/db.js";

// Add this helper to your seeder or a utility file
const resetSequence = async (model) => {
  const tableName = model.getTableName();
  const primaryKey = model.primaryKeyAttribute;
  
  try {
    // This works for PostgreSQL
    await model.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('${tableName}', '${primaryKey}'), coalesce(max(${primaryKey}), 0) + 1, false) FROM "${tableName}";`
    );
    console.log(`✅ Sequence reset for ${tableName}`);
  } catch (error) {
    console.error(`❌ Failed to reset sequence for ${tableName}:`, error.message);
  }
};

export default resetSequence