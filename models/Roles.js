import { DataTypes } from 'sequelize';
import BaseModel from '../bases/BaseModel.js';

export default (sequelize) => {
    class Roles extends BaseModel {}

    Roles.init({
        id: {
            type: DataTypes.INTEGER, 
            primaryKey: true,
            autoIncrement: true, 
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
        // ❌ Removed isDeleted: paranoid mode uses 'deleted_at' instead
    }, {
        sequelize,      
        modelName: 'Role',
        tableName: 'roles',
        underscored: true, // This turns 'deletedAt' into 'deleted_at'
        paranoid: true,    // This enables the soft-delete functionality
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['name', 'deleted_at'] // ✅ Matches the underscored column name
            }
        ]
    });

    return Roles; 
}