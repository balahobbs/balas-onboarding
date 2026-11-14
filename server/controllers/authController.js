import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Enter your email and password.');
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('manager', 'name');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Email or password is incorrect.');
  }
  user.password = undefined;
  res.json({ token: sign(user._id), user });
});

export const me = asyncHandler(async (req, res) => {
  await req.user.populate('manager', 'name');
  res.json(req.user);
});
