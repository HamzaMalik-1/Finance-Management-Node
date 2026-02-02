import { DataTypes } from 'sequelize';
import BaseModel from '../bases/BaseModel.js';

export default (sequelize) => {
    class Roles extends BaseModel {}

    Roles.init({
        // 1. Attributes
        id: {
            type: DataTypes.INTEGER, 
            primaryKey: true,
            autoIncrement: true, 
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        isDeleted:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        }
    }, {

        sequelize,      
        modelName: 'Role',
        tableName: 'roles',
        underscored: true,
        timestamps: true,
    });

    return Roles; 
}