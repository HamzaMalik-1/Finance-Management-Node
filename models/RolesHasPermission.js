import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js"; // Added .js extension

export default (sequelize) => {
  class RoleHasPermission extends BaseModel {}

  RoleHasPermission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Recommended for junction models
        allowNull: false,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Permission must belong to a role
        references: {
          model: "roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // If role is gone, permissions should be too
      },
      moduleId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Permission must belong to a module
        references: {
          model: "modules",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Safer to default to false (Privilege of Least Access)
      },
      isWrite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isUpdate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "RoleHasPermission",
      tableName: "role_has_permissions", // Plural is standard
      underscored: true,
      timestamps: true,
    },
  );
  return RoleHasPermission;
};