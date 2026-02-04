
import express from "express"
import { createRole, deleteRole, updateRoleAndPermission } from "../../controllers/v1/roleController.js"

const router = express.Router()

router.post('/roles',createRole)
router.delete('/roles/:id',deleteRole)
router.put('/roles/:id',updateRoleAndPermission)

export default router