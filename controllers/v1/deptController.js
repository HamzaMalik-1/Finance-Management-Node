import { Debt, Contact, Account } from "../../models/index.js";
import BaseController from "../../bases/BaseController.js";
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../config/db.js"

const DebtController = new BaseController(Debt);
const ContactController = new BaseController(Contact);

export const createDebt = asyncHandler(async (req, res) => {
    DebtController.bodyExist(req.body);
    
    // Check for contactId OR contactName (to allow quick creation)
    if (!req.body.contactId && !req.body.contactName) {
        throw new BadRequestError("Please provide either a contactId or a contactName.");
    }

    // Required fields for the Debt itself
    DebtController.requireFields(req.body, ["userId", "accountId", "amount", "type"]);

    const { userId, contactId, contactName, phoneNumber, amount } = req.body;

    const newDebt = await sequelize.transaction(async (t) => {
        let finalContactId = contactId;

        // 1. If no contactId, create a new Contact first
        if (!finalContactId) {
            const newContact = await ContactController.create({
                userId,
                name: contactName,
                phoneNumber: phoneNumber || null,
            }, { transaction: t });
            
            finalContactId = newContact.id;
        }

        // 2. Prepare Debt data
        const debtData = {
            ...req.body,
            contactId: finalContactId,
            remainingAmount: amount // Initial balance equals full amount
        };

        // 3. Create the Debt
        // This will trigger the 'afterCreate' hook to create the initial Transaction
        return await DebtController.create(debtData, { transaction: t });
    });

    return sendResponse(
        res, 
        StatusCodes.CREATED, 
        "Debt and contact processed successfully", 
        newDebt
    );
});


// Example logic for calculating total debt with interest
export const getUserDebts = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const debts = await Debt.findAll({
        where: { userId },
        include: [{ model: Contact, as: 'contactPerson' }]
    });

    const detailedDebts = debts.map(debt => {
        const principal = parseFloat(debt.amount);
        const rate = parseFloat(debt.interestRate);
        
        // Example: Annual Simple Interest
        // You could calculate this based on the time difference between now and createdAt
        const interest = (principal * rate) / 100; 
        const totalToPay = principal + interest;

        return {
            ...debt.toJSON(),
            interestAmount: interest,
            totalObligation: totalToPay,
            remainingWithInterest: totalToPay - (principal - parseFloat(debt.remainingAmount))
        };
    });

    return sendResponse(res, StatusCodes.OK, "Debts fetched", detailedDebts);
});


export const getDebtSummary = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const summary = await Debt.findAll({
        where: { userId, status: ['active', 'partially_paid'] },
        attributes: [
            'type',
            [sequelize.fn('SUM', sequelize.col('remaining_amount')), 'totalAmount']
        ],
        group: ['type']
    });

    return sendResponse(res, StatusCodes.OK, "Debt summary calculated", summary);
});