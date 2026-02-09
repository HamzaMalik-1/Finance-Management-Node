import express from 'express';
import { 
    createDebt, 
    getUserDebts, 
    getDebtSummary 
} from '../../controllers/v1/deptController.js';

const router = express.Router();

// 1. Create a new Debt record
router.post('/', createDebt);

// 2. Get list of all debts for a user
router.get('/user/:userId', getUserDebts);

// 3. Get total summary (Total Borrowed vs Total Lent)
router.get('/user/:userId/summary', getDebtSummary);

export default router;