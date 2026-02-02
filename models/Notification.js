import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class Notification extends BaseModel {}

  Notification.init({
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
    // Type: e.g., 'budget_alert', 'recurring_success', 'security', 'system'
    type: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    message: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    isRead: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    // Link: A relative URL or Deep Link (e.g., /transactions/uuid) to take the user to the source
    link: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    readAt: { 
      type: DataTypes.DATE, 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    underscored: true,
    timestamps: true, // This gives you 'created_at' automatically
    updatedAt: false  // Usually notifications aren't updated, just read
  });

  return Notification;
};