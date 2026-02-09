import express from 'express'
import { changeTransactionStatus, createTransaction, getUserTransactions } from '../../controllers/v1/transactionController.js'

const router = express.Router()

router.post('/transaction',createTransaction)
router.get('/transaction/:userId', getUserTransactions);
router.patch('/:id/status', changeTransactionStatus);

export default router