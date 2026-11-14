import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) {
    res.status(401);
    throw new Error('Sign in to continue.');
  }
  let id;
  try {
    id = jwt.verify(token, process.env.JWT_SECRET).id;
  } catch {
    res.status(401);
    throw new Error('Your session has expired. Sign in again.');
  }
  req.user = await User.findById(id);
  if (!req.user) {
    res.status(401);
    throw new Error('This account no longer exists.');
  }
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('You do not have permission to do that.');
  }
  next();
};
