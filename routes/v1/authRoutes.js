import express from 'express'
import { signup,sendotp,verifyotp,login } from '../../controllers/v1/authController.js'


const router = express.Router()

router.post('/signup',signup)
router.post('/sendotp',sendotp)
router.post('/verifyotp',verifyotp)
router.post('/login',login)


export default router