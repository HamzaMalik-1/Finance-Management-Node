import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";

// UserAddress.js (Junction Table)
export default (sequelize) => {
  class UserAddress extends BaseModel {}
  UserAddress.init(
    {
      userId: {
        type: DataTypes.UUID,
        references: { model: "users", key: "id" },
      },
      addressId: {
        type: DataTypes.INTEGER,
        references: { model: "addresses", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "UserAddress",
      tableName: "user_addresses",
      underscored: true,
      paranoid:true
    },
  );
  return UserAddress;
};
