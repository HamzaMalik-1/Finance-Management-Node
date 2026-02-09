// routes/v1/budgetRoutes.js
import express from 'express';
import { 
    createBudget, 
    getUserBudgets, 
    updateBudget, 
    deleteBudget 
} from '../../controllers/v1/budgetController.js';

const router = express.Router();

router.post("/", createBudget);
router.get("/user/:userId", getUserBudgets);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;