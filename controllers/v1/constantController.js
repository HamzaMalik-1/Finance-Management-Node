import BaseController from '../../bases/BaseController.js';
import { Currency,Country,City } from '../../models/index.js';
import asyncHandler from '../../utils/AsyncHelper/Async.js';
import ApiError from '../../utils/ErrorHelpers/ApiError.js';
import sendResponse from '../../utils/ResponseHelpers/sendResponse.js';
import { StatusCodes } from 'http-status-codes';

const CountryController =new BaseController(Country)
const CityController =new BaseController(City)
// Fetch all currencies for the settings dropdown
export const getCurrencies = asyncHandler(async (req, res) => {
    const currencies = await Currency.findAll({
        attributes: ['id', 'name', 'code', 'symbol'],
        order: [['name', 'ASC']]
    });

    return sendResponse(
        res, 
        StatusCodes.OK, 
        "Currencies fetched successfully", 
        currencies
    );
});
// ... existing imports
export const getCountries = asyncHandler(async (req, res) => {
    const countries = await Country.findAll({
        attributes: ["id", "isoCode", "name", "phoneCode"],
        order: [["name", "ASC"]]
    });
    return sendResponse(res, StatusCodes.OK, "Countries fetched successfully", countries);
});

export const getCity = asyncHandler(async (req, res) => {
    const { countryId } = req.query;

    if (!countryId) {
        return sendResponse(res, StatusCodes.BAD_REQUEST, "Country ID is required", null);
    }

    const cities = await City.findAll({
        where: { countryId },
        attributes: ["id", "name"],
        order: [["name", "ASC"]]
    });

    return sendResponse(res, StatusCodes.OK, "Cities fetched successfully", cities);
});