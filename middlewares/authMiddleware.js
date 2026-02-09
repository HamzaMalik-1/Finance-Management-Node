import { createClient } from '@supabase/supabase-js';
import { UnAuthorizedError } from '../utils/ErrorHelpers/Errors.js';
import asyncHandler from '../utils/AsyncHelper/Async.js';

// Initialize Supabase Client (usually imported from a config file)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnAuthorizedError("You are not logged in. Please login to get access.");
  }

  // 2. Verify token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new UnAuthorizedError("Invalid token or session expired.");
  }

  // 3. Attach user to request
  // Now you can use req.user.id in your controllers!
  req.user = user;
  next();
});