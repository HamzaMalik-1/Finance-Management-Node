import { StatusCodes } from "http-status-codes";
import {
  AlreadyExist,
  BadRequestError,
  NotFoundError,
  InternalServerError,
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
    const record = await this.model.findOne({ where: filter });
    if (record) {
      throw new AlreadyExist(message);
    }
    return null;
  }

  async create(data) {
    return await this.model.create(data);
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
    } = options;

    if (paginate) {
      const offset = (page - 1) * limit;
      const { rows, count } = await this.model.findAndCountAll({
        where: filter,
        order,
        limit,
        offset,
        include,
      });

      return {
        data: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
      };
    }

    const data = await this.model.findAll({ where: filter, order, include });
    return { data };
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
}



export default BaseController;
