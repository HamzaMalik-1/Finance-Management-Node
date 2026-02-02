import { DataTypes } from "sequelize";
import BaseModel from "../bases/BaseModel.js";


export default (sequelize)=>{

    class Modules extends BaseModel{}

    Modules.init({
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
        }
        ,
        name:
        {
            type:DataTypes.STRING,
            allowNull:false,
            unique:true,
        },
        isDeleted:{
            type:DataTypes.BOOLEAN,
            defaultValue:false,

        }
    },{

        sequelize,
        modelName:"Modules",
        tableName:"modules",
        underscored:true,
        timestamps:true
    }

)
return Modules;
}