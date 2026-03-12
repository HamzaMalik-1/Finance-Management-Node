import express from 'express';
import { getDashboardSummary } from '../../controllers/v1/dashboardController.js';
import { protect } from '../../middlewares/authMiddleware.js'; // Assuming you have this

const router = express.Router();

// ✅ Intelligence is private data; always protect this route
router.get('/summary/:userId', protect, getDashboardSummary);

export default router;