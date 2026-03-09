import express from 'express'
import { getDashboardSummary } from '../../controllers/v1/dashboardController.js';
const router =express.Router()

router.get('/summary/:userId', getDashboardSummary);

export default router