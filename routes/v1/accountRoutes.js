import express from 'express';
import { 
    createAccount, 
    getUserAccounts, 
    updateAccount, 
    deleteAccount 
} from '../../controllers/v1/accountController.js';

const router = express.Router();

router.post("/", createAccount);
router.get("/user/:userId", getUserAccounts);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;