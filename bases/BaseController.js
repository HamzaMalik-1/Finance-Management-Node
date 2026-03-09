import { StatusCodes } from "http-status-codes";
import {
  AlreadyExist,
  BadRequestError,
  NotFoundError,
  InternalServerError,
  CreationError,
} from "../utils/ErrorHelpers/Errors.js";
import ApiError from "../utils/ErrorHelpers/ApiError.js";
import logger from "../utils/logger.js";
import { where } from "sequelize";

class BaseController {
  constructor(model) {
    this.model = model;
    if (!this.model) {
      logger.error("BaseController initialization failed: Model not provided");
      throw new Error("Model must be provided to BaseController");
    }
  }

  requireFields(body, fields) {
    const missing = fields.filter((field) => !body[field]);
    if (missing.length > 0) {
      logger.warn(`Missing fields: ${missing.join(", ")}`);
      // Pass the missing fields array into the 'details' parameter
      throw new BadRequestError("errors.validation_error", {
        missingFields: missing,
      });
    }
  }

   requireFieldsInParams(param, fields) {
    const missing = fields.filter((field) => !param[field]);
    if (missing.length > 0) {
      logger.warn(`Missing fields: ${missing.join(", ")}`);
      // Pass the missing fields array into the 'details' parameter
      throw new BadRequestError("errors.validation_error", {
        missingFields: missing,
      });
    }
  }

  async update(filter, data, options = {}) {
    const { include = [], attributes = null, transaction = null } = options;

    // 1. Find the record first to verify existence
    const record = await this.model.findOne({ 
      where: filter,
      transaction 
    });

    if (!record) {
      throw new NotFoundError("errors.not_found");
    }

    // 2. Perform the update
    await record.update(data, { transaction });

    // 3. Re-fetch the updated record to include associations
    // This ensures your frontend Edit Modal gets the nested IDs it needs.
    const updatedRecord = await this.model.findOne({
      where: filter,
      include,
      attributes,
      transaction
    });

    return updatedRecord;
  }

  // bases/BaseController.js

  validatePassword(password) {
    // Regex: Min 8 chars, at least 1 letter and 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
      throw new BadRequestError("errors.validation_error", {
        hint: "Password must be at least 8 characters long and include both letters and numbers.",
      });
    }
  }

  bodyExist(body) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestError("errors.bad_request");
    }
  }

  paramsExist(params, requiredKeys = []) {
    if (!params || Object.keys(params).length === 0) {
      throw new BadRequestError("errors.bad_request");
    }

    for (const key of requiredKeys) {
      if (!params[key] || String(params[key]).trim() === "") {
        throw new BadRequestError(`Missing parameter: ${key}`);
      }
    }
  }

  fileExist(file) {
    if (!file) {
      throw new BadRequestError("errors.validation_error");
    }
  }

 async alreadyExist(filter, message = "errors.already_exists") {
    const record = await this.model.findOne({ 
      where: filter 
    });

    if (record) {
      throw new AlreadyExist(message);
    }
    return null;
  }

  async create(data,option={}) {
    const record= await this.model.create(data,option);
    if(!record)
    {
      throw new CreationError()
    }
    return record
  }

  async delete(filter,options={}) {
    const record = await this.model.findOne({ where: filter });
    if (!record) {
      throw new NotFoundError("errors.not_found");
    }
    await record.destroy();
    return record;
  }

  async deleteAll(filter, options = {}) {
  return await this.model.destroy({
    where: filter,
    ...options // This allows passing { transaction: t }
  });
}

  // bases/BaseController.js
  async softDelete(filter) {
    const record = await this.model.findOne({ where: filter });

    if (!record) {
      throw new NotFoundError("errors.not_found");
    }
    await record.destroy();

    return record;
  }

  async findOne(filter, message = "errors.not_found", include = []) {
    const record = await this.model.findOne({
      where: filter,
      include,
    });

    if (!record) {
      throw new NotFoundError(message);
    }
    return record;
  }

   async find(filter, include = []) {
    const record = await this.model.findOne({
      where: filter,
      include,
    });
    return record;
  }

  async findOrCreate(filter, data) {
    let record = await this.model.findOne({ where: filter });
    if (!record) {
      record = await this.model.create(data);
    }
    return record;
  }

  async getAllOrPaginated(filter = {}, options = {}) {
    const {
      paginate = false,
      page = 1,
      limit = 10,
      order = [["createdAt", "DESC"]],
      include = null,
      attributes=null
    } = options;

    if (paginate) {
      const offset = (page - 1) * limit;
      const { rows, count } = await this.model.findAndCountAll({
        where: filter,
        order,
        limit,
        offset,
        include,
        attributes
      });

      return {
        list: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
      };
    }

    const data = await this.model.findAll({ where: filter, order, include,attributes });
    return  data ;
  }

  

  isObject(value) {
    const check =
      value !== null && typeof value === "object" && !Array.isArray(value);
    if (!check) {
      throw new BadRequestError("errors.object_error");
    }
    return;
  }


  async bulkCreate(dataArray, options = {}) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }
    return await this.model.bulkCreate(dataArray, options);
  }

  async updateBulk(dataArray, identifier = 'id', options = {}) {
  const results = [];
  
  // We use for...of to handle the async/await properly
  for (const item of dataArray) {
    const filter = { [identifier]: item[identifier] };
    
    // update() returns [rowsAffected, [updatedRows]]
    const updated = await this.model.update(item, {
      where: filter,
      ...options // Pass transaction: t here
    });
    
    results.push(updated);
  }
  
  return results;
}
 isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid= emailRegex.test(email);
  if(!isValid)
  {
    throw new BadRequestError("errors.invalid_email_format");
  }
  return
};
}



export default BaseController;
