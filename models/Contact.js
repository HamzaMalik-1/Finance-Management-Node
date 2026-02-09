import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class Contact extends BaseModel {}

  Contact.init({
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
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    phoneNumber: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    }
  }, {
    sequelize,
    modelName: "Contact",
    tableName: "contacts",
    underscored: true,
    timestamps: true,
    paranoid: true
  });

  return Contact;
};