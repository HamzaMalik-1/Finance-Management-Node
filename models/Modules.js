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
            
        },
       
    },{

        sequelize,
        modelName:"Modules",
        tableName:"modules",
        underscored:true,
        timestamps:true,
        paranoid: true,    
        indexes:[
            {
                unique:true,
                fields:['name','deleted_at']
            }
        ]
    }

)
return Modules;
}