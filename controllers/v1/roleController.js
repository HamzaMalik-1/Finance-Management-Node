import asyncHandler from "../../utils/AsyncHelper/Async.js";
import { Modules, Role, RoleHasPermission } from "../../models/index.js";
import BaseController from "../../bases/BaseController.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../../utils/ErrorHelpers/Errors.js";
import logger from "../../utils/logger.js";
import { sequelize } from "../../config/db.js"; // Import your sequelize instance

const RoleController = new BaseController(Role);
const RoleHasPermissionController = new BaseController(RoleHasPermission);
// const ModulesController = new BaseController(Modules);
// update this swagger
/**
 * @swagger
 * /api/v1/role/roles:
 *   post:
 *     summary: Create new role
 *     tags: [Role v1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: Role created successfully
 */

export const createRole = asyncHandler(async (req, res) => {
  RoleController.bodyExist(req.body);
  RoleController.requireFields(req.body, ["name", "modules"]);

  const { name, modules } = req.body;

  if (!Array.isArray(modules)) {
    throw new BadRequestError("specific_errors.module_not_array");
  }

  const result = await sequelize.transaction(async (t) => {
    const role = await RoleController.create({ name }, { transaction: t });

    const permissionsData = modules.map((mod) => ({
      roleId: role.id,
      moduleId: mod.module_id,
      isRead: mod.isRead || false,
      isWrite: mod.isWrite || false,
      isDelete: mod.isDelete || false,
      isUpdate: mod.isUpdate || false,
    }));
    const createdPermissions = await RoleHasPermission.bulkCreate(
      permissionsData,
      {
        transaction: t,
      },
    );

    return { role, count: createdPermissions.length };
  });

  return sendResponse(
    res,
    StatusCodes.CREATED,
    "Role and Permissions Created Successfully",
    result,
  );
});

export const deleteRole = asyncHandler(async (req, res) => {
  RoleController.paramsExist(req.params);
  const { id } = req.params;

  const role = await RoleController.softDelete({ id });
  sendResponse(res, StatusCodes.OK, "Role Deleted", role);
});

export const updateRoleAndPermission = asyncHandler(async (req, res) => {
  RoleHasPermissionController.bodyExist(req.body);
  RoleHasPermissionController.requireFields(req.body, ["modules"]);
  RoleHasPermissionController.paramsExist(req.params);
  const role_id = req.params.id;
  const { modules } = req.body;
  console.log("role_id", role_id);
  await sequelize.transaction(async (t) => {
    await RoleHasPermissionController.deleteAll({ role_id }, { transaction: t });
    const permissionsData = modules.map((mod) => ({
      roleId: role_id,
      moduleId: mod.module_id,
      isRead: mod.isRead || false,
      isWrite: mod.isWrite || false,
      isDelete: mod.isDelete || false,
      isUpdate: mod.isUpdate || false,
    }));
    await RoleHasPermissionController.bulkCreate(permissionsData, {
      transaction: t,
    });
  });

  return sendResponse(res, StatusCodes.OK, "Permissions synced successfully");
});
