import {User,UserSettings, UserContact, UserAddress, Address,Country,City} from '../../models/index.js'
import asyncHandler from '../../utils/AsyncHelper/Async.js'
import BaseController from '../../bases/BaseController.js'
import sendResponse from '../../utils/ResponseHelpers/sendResponse.js'
import { StatusCodes } from 'http-status-codes'
import { sequelize } from '../../config/db.js'
const UserController =new BaseController(User)
const UserSettingsController =new BaseController(UserSettings)
const UserContactController =new BaseController(UserContact)
const UserAddressController =new BaseController(UserAddress)
const AddressController =new BaseController(Address)
const CountryController =new BaseController(Country)
const CityController =new BaseController(City)

export const CreateUser = asyncHandler( async ( req,res)=>{
// role 1 is admin
// role 2 is user
    UserController.bodyExist(req.body)
    UserController.requireFields(req.body,["id","username","firstName","lastName","displayName","recoveryEmail"])
    const {id,username,firstName,lastName,displayName,recoveryEmail}=req.body

    UserController.isValidEmail(recoveryEmail)

  await  UserController.alreadyExist({id:id})

  const newUser =await  UserController.create({id,username,firstName,lastName,displayName,recoveryEmail,roleId:2})
  return sendResponse(res, StatusCodes.CREATED, "User created successfully", newUser);
})

export const addUserContact = asyncHandler(async (req, res) => {
    UserContactController.bodyExist(req.body);
    UserContactController.requireFields(req.body, ["userId", "phoneNumber"]);
    
    const { userId, phoneNumber } = req.body;
    
    await UserContactController.alreadyExist({ phoneNumber });
    
    const isAlready = await UserContactController.find({userId:userId})
    let isPrimary=true
    if(isAlready)
    {
        isPrimary=false
    }
    const contact = await UserContactController.create({ userId, phoneNumber ,isPrimary});
    return sendResponse(res, StatusCodes.CREATED, "Contact added", contact);
});

/**
 * 3. Add Address (Atomic Transaction)
 */
export const addUserAddress = asyncHandler(async (req, res) => {
    AddressController.bodyExist(req.body);
    AddressController.requireFields(req.body, ["userId", "countryId", "cityId", "address"]);

    const { userId, countryId, cityId, address } = req.body;

    const result = await sequelize.transaction(async (t) => {
        // Create the physical address
      await  CountryController.findOne({id:countryId})
      await  CityController.findOne({id:cityId})
        const newAddress = await AddressController.create({ 
            countryId, cityId, addressLine:address 
        }, { transaction: t });

        // Link address to user
        await UserAddressController.create({ 
            userId, 
            addressId: newAddress.id 
        }, { transaction: t });

        return newAddress;
    });

    return sendResponse(res, StatusCodes.CREATED, "Address linked successfully", result);
});

/**
 * 4. Get Registration/Onboarding Status
 */
export const GetRegistrationStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    UserController.paramsExist(req.params, ["userId"]);

    // Fetch all statuses in parallel for performance
    const [user, settings, contact, address] = await Promise.all([
        User.findByPk(userId),
        UserSettings.findOne({ where: { userId } }),
        UserContact.findOne({ where: { userId } }),
        UserAddress.findOne({ where: { userId } })
    ]);

    const status = {
        isUser: !!user,
        isSettings: !!settings,
        isContact: !!contact,
        isAddress: !!address
    };

    return sendResponse(res, StatusCodes.OK, "Registration status fetched", status);
});

/**
 * 5. Add/Initialize User Settings (Manual)
 */
export const addUserSettings = asyncHandler(async (req, res) => {
    UserSettingsController.bodyExist(req.body);
    // userId is mandatory, others have defaults in the model
    UserSettingsController.requireFields(req.body, ["userId"]);

    const { userId, baseCurrencyId, themePreference, languageId, profilePicture } = req.body;

    // Check if settings already exist for this user to prevent duplicates
    const existingSettings = await UserSettings.findOne({ where: { userId } });
    
    if (existingSettings) {
        throw new AlreadyExist("errors.settings_already_exist");
    }

    const settings = await UserSettingsController.create({
        userId,
        baseCurrencyId: baseCurrencyId || 1, // Defaulting to your base currency (e.g., PKR)
        themePreference: themePreference || 'system',
        languageId: languageId || 1,
        profilePicture: profilePicture || null
    });

    return sendResponse(res, StatusCodes.CREATED, "User settings initialized successfully", settings);
});

/**
 * 6. Update User Settings
 */
export const updateUserSettings = asyncHandler(async (req, res) => {
    UserSettingsController.bodyExist(req.body);
    UserSettingsController.paramsExist(req.params, ["userId"]);
    
    const { userId } = req.params;

    // Use the BaseController update logic
    // We filter by userId instead of the settings primary key for frontend convenience
    const updatedSettings = await UserSettingsController.update({ userId }, req.body);

    return sendResponse(res, StatusCodes.OK, "User settings updated successfully", updatedSettings);
});