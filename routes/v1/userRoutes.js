import express from 'express' 
import { addUserAddress, addUserContact, CreateUser, GetRegistrationStatus } from '../../controllers/v1/userController.js'

const router=express.Router()


router.post('/users',CreateUser)
router.get('/status/:userId',GetRegistrationStatus)
router.post('/contact',addUserContact)
router.post('/address',addUserAddress)


export default router