import { StatusCodes } from "http-status-codes";
import { Notification } from "../../models/index.js";
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import BaseController from "../../bases/BaseController.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";

const NotificationController = new BaseController(Notification);

export const getUserNotifications = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const notifications = await NotificationController.getAllOrPaginated(
        { userId },
        { 
            paginate: true, 
            page, 
            limit,
            order: [['createdAt', 'DESC']] // Newest first
        }
    );
    return sendResponse(res, StatusCodes.OK, "Notifications fetched", notifications);
});

export const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    
    if (notification) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
    }
    return sendResponse(res, StatusCodes.OK, "Marked as read", notification);
});

export const markAllRead = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    await Notification.update(
        { isRead: true, readAt: new Date() },
        { where: { userId, isRead: false } }
    );
    return sendResponse(res, StatusCodes.OK, "All marked as read");
});