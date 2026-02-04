import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import BaseController from "../../bases/BaseController.js";
import { User } from "../../models/index.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";
import { supabase } from "../../config/db.js"; // Ensure you have this config
import {
  UnauthorizedError,
  BadRequestError,
} from "../../utils/ErrorHelpers/Errors.js";

const UserController = new BaseController(User);

/**
 * @desc    Signup using Supabase Auth and Sync to Local DB
 */
/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user (v1)
 *     tags: [Auth v1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: hamza_dev
 *               email:
 *                 type: string
 *                 example: hamza@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or weak password
 */

export const signup = asyncHandler(async (req, res) => {
  UserController.bodyExist(req.body);
  UserController.requireFields(req.body, ["username", "email", "password"]);

  const { username, email, password } = req.body;
  UserController.validatePassword(password);

  const { data, error: supabaseError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (supabaseError) {
    throw new BadRequestError(supabaseError.message, supabaseError);
  }

  return sendResponse(
    res,
    StatusCodes.CREATED,
    "User registered successfully",
    {
      user: data.user,
      session: data.session,
    },
  );
});

/**
 * @desc    Send OTP via Supabase (if using OTP-only) or Custom Nodemailer
 */
export const sendotp = asyncHandler(async (req, res) => {
  UserController.bodyExist(req.body);
  UserController.requireFields(req.body, ["email"]);

  const { email } = req.body;

  // Supabase built-in OTP method
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    throw new BadRequestError(error.message);
  }

  return sendResponse(res, StatusCodes.OK, "OTP sent to your email");
});

/**
 * @desc    Verify OTP via Supabase
 */
export const verifyotp = asyncHandler(async (req, res) => {
  UserController.bodyExist(req.body);
  UserController.requireFields(req.body, ["email", "otp"]);

  const { email, otp } = req.body;

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "signup", // or 'magiclink' depending on your flow
  });

  if (error) {
    throw new UnauthorizedError("errors.unauthorized");
  }

  return sendResponse(res, StatusCodes.OK, "OTP is verified", data);
});

/**
 * @desc    Login using Supabase Auth
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user and get session
 *     tags: [Auth v1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: hamza@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       201:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */


export const login = asyncHandler(async (req, res) => {
  UserController.bodyExist(req.body);
  UserController.requireFields(req.body, ["email", "password"]);
  const { email, password } = req.body;
  UserController.validatePassword(password);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw UnauthorizedError("error.unauthorized");
  }

  if (data?.user) {
    // Extract only the fields you need
    const cleanUser = {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username || null, // Metadata from signup
      last_login: data.user.last_sign_in_at,
      token:data.session.access_token
    };

    return sendResponse(res, StatusCodes.OK, "Login Successfully", {
      user: cleanUser, // ✅ Now only sends the 4 fields above
      // session: data.session,
    });
  }
});

// export const login = asyncHandler(async (req, res) => {
//   UserController.bodyExist(req.body);
//   const { email, password } = req.body;

//   if (!email || !password) {
//     throw new BadRequestError("errors.bad_request");
//   }

//   // Authenticate with Supabase
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) {
//     throw new UnauthorizedError("errors.unauthorized");
//   }

//   // Fetch local user details for the frontend
//   const localUser = await UserController.findOne(
//     { id: data.user.id },
//     "errors.not_found",
//   );

//   return sendResponse(res, StatusCodes.OK, "Login Successfully", {
//     user: localUser,
//     session: data.session, // Contains access_token and refresh_token
//   });
// });
