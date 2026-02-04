import { Error } from "sequelize";

class ApiError extends Error{
    constructor(statusCode,message,details=null,isOperational=true){
        super(message)
           this.name = this.constructor.name;
        this.statusCode=statusCode
        this.details=details
        this.isOperational=isOperational

        Error.captureStackTrace(this,this.constructor)
    }
}

export default ApiError