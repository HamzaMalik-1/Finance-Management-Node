import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

export default (sequelize) => {
  class UserRole extends BaseModel {}

  UserRole.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      roleId: {
        type: DataTypes.INTEGER, // Must match your 'roles' table ID type
        allowNull: false,
        references: { model: "roles", key: "id" },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "UserRole",
      tableName: "user_roles",
      underscored: true,
      timestamps: true, // Recommended for tracking when roles were assigned
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "role_id"],
        },
      ],
    },
  );

  return UserRole;
};
