import { signup } from '../controllers/v1/authController.js';
import { supabase } from '../config/db.js';

// 1. Mock the models index to prevent Sequelize initialization errors
// This prevents the "No Sequelize instance passed" error by replacing the model with a mock
jest.mock('../models/index.js', () => ({
  User: {
    init: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  }
}));

// 2. Mock Supabase Auth
jest.mock('../config/db.js', () => ({
  supabase: {
    auth: {
      signUp: jest.fn()
    }
  }
}));

// 3. Mock the response helper to prevent issues with i18n or Winston during tests
jest.mock('../utils/ResponseHelpers/sendResponse.js', () => {
  return jest.fn((res, statusCode, message, data) => {
    return res.status(statusCode).json({ success: true, message, data });
  });
});
describe('Auth Controller - Signup', () => {
  let req, res, next; // ✅ Added next

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = { 
      body: { 
        username: 'testuser', 
        email: 'test@gmail.com', 
        password: 'Password123' 
      } 
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn(); // ✅ Initialize next as a mock function
  });

 test('Should fail if Supabase returns an error', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "User already exists" }
    });

    await signup(req, res, next);

    // ✅ Add this line to wait for the promise queue to clear
    await new Promise(process.nextTick); 

    // Now check if next was called
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("User already exists");
  });
});