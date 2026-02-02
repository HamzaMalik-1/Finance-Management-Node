import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class Category extends BaseModel {}

  Category.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // NULL allows for "System Default" categories available to all
      references: { model: 'users', key: 'id' }
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    type: { 
      type: DataTypes.ENUM('income', 'expense'), 
      allowNull: false 
    },
    icon: { 
      type: DataTypes.STRING, 
      defaultValue: 'category-default' 
    },
    color: { 
      type: DataTypes.STRING, 
      defaultValue: '#4A90E2' 
    },
    // Sub-category logic starts here
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true, // If null, it is a Top-Level Category
      references: { model: 'categories', key: 'id' },
      onDelete: 'CASCADE'
    },
    isDefault: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false // True for categories you provide (Salary, Food, etc.)
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    }
  }, {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    underscored: true,
    timestamps: true
  });

  return Category;
};