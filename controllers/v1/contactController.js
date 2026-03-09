import { Contact } from "../../models/index.js";
import BaseController from "../../bases/BaseController.js";
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";
import { StatusCodes } from "http-status-codes";

const ContactController = new BaseController(Contact);

export const getUserContacts = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validate userId existence in params
    if (!userId) {
        return sendResponse(res, StatusCodes.BAD_REQUEST, "errors.user_id_required");
    }

    // Fetch contacts for the specific user
    const contacts = await Contact.findAll({
        where: { userId },
        order: [['name', 'ASC']] // Alphabetical order for the directory
    });

    return sendResponse(
        res, 
        StatusCodes.OK, 
        "contacts.fetched_successfully", 
        contacts
    );
});