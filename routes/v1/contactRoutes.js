import express from 'express';
import { getUserContacts } from '../../controllers/v1/contactController.js';

const router = express.Router();

// The path /user/:userId combined with the base path in app.js 
// creates: GET /api/v1/contacts/user/:userId
router.get('/user/:userId', getUserContacts);

export default router;