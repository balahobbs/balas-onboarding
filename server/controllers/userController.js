import User from '../models/User.js';
import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildTasksFor } from '../utils/defaultTasks.js';
import { reportIds, canSee, progressFor } from '../utils/scope.js';

const TEMP_PASSWORD = 'Welcome@123';

export const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'manager') filter.manager = req.user._id;
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).populate('manager', 'name').sort({ startDate: -1 }).lean();
  const progress = await progressFor(users.map((u) => u._id));
  res.json(users.map((u) => ({ ...u, progress: progress[u._id] || { total: 0, done: 0, overdue: 0, percent: 0 } })));
});

export const getManagers = asyncHandler(async (req, res) => {
  res.json(await User.find({ role: 'manager' }).select('name department'));
});

export const getUser = asyncHandler(async (req, res) => {
  const ids = await reportIds(req.user);
  const isSelf = String(req.user._id) === req.params.id;
  if (!isSelf && !canSee(ids, req.params.id)) {
    res.status(403);
    throw new Error('You do not have access to this person.');
  }
  const user = await User.findById(req.params.id).populate('manager', 'name').lean();
  if (!user) {
    res.status(404);
    throw new Error('Employee not found.');
  }
  const progress = await progressFor([user._id]);
  res.json({ ...user, progress: progress[user._id] || { total: 0, done: 0, overdue: 0, percent: 0 } });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, department, jobTitle, startDate, manager, password } = req.body;
  const tempPassword = password || TEMP_PASSWORD;
  const user = await User.create({ name, email, role, department, jobTitle, startDate: startDate || undefined, manager: manager || null, password: tempPassword });
  let tasksCreated = 0;
  if (user.role === 'employee') {
    const tasks = await Task.insertMany(buildTasksFor(user, req.user._id));
    tasksCreated = tasks.length;
  }
  res.status(201).json({ user, tempPassword, tasksCreated });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Employee not found.');
  }
  ['name', 'email', 'role', 'department', 'jobTitle', 'startDate'].forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });
  if (req.body.manager !== undefined) user.manager = req.body.manager || null;
  if (req.body.password) user.password = req.body.password;
  await user.save();
  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    res.status(400);
    throw new Error('You cannot delete your own account.');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Employee not found.');
  }
  await Task.deleteMany({ assignee: user._id });
  await user.deleteOne();
  res.json({ message: 'Employee and their tasks were removed.' });
});
