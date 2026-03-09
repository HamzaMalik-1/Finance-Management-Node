import express from 'express' 
import { addUserAddress, addUserContact, addUserSettings, CreateUser, GetRegistrationStatus, getUserProfile, getUserSettings, updateUserProfile, updateUserSettings } from '../../controllers/v1/userController.js'

const router=express.Router()


router.post('/users',CreateUser)
router.get('/status/:userId',GetRegistrationStatus)
router.post('/contact',addUserContact)
router.post('/address',addUserAddress)
router.post('/settings',addUserSettings)


router.get('/settings/:userId', getUserSettings);    // Fetch settings (Read)
router.put('/settings/:userId', updateUserSettings); // Update settings (Update)

router.get('/profile/:userId', getUserProfile);
router.put('/profile/:userId', updateUserProfile);

export default router