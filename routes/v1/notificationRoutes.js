
import express from "express"
import { getUserNotifications, markAllRead, markAsRead } from "../../controllers/v1/notificationController.js";

const router =express.Router()

router.get('/:userId', getUserNotifications);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllRead);


export default router