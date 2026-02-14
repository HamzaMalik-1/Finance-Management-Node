import express from 'express';
import { getCity, getCountries, getCurrencies } from '../../controllers/v1/constantController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect)
router.get('/currencies', getCurrencies);
router.get('/countries', getCountries);
router.get('/cities', getCity);

export default router;