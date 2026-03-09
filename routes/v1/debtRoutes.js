import express from 'express';
import { 
    createDebt, 
    getUserDebts, 
    getDebtSummary, 
    getDebtDetails,
    addRepayment
} from '../../controllers/v1/deptController.js';

const router = express.Router();

// 1. Create a new Debt record
router.post('/', createDebt);

// 2. Get list of all debts for a user
router.get('/user/:userId', getUserDebts);

// 3. Get total summary (Total Borrowed vs Total Lent)
router.get('/user/:userId/summary', getDebtSummary);

// To this:
router.get('/details/:id', getDebtDetails); 

// And do the same for repayments:
router.post('/repayment/:id', addRepayment);

export default router;