import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';
import { visibleIds, canSee } from '../utils/scope.js';

const populate = { path: 'assignee', select: 'name jobTitle department' };

export const getTasks = asyncHandler(async (req, res) => {
  const ids = await visibleIds(req.user);
  const filter = { assignee: { $in: ids } };
  if (req.query.assignee) {
    if (!canSee(ids, req.query.assignee)) {
      res.status(403);
      throw new Error('You do not have access to this person.');
    }
    filter.assignee = req.query.assignee;
  }
  if (req.query.status) filter.status = req.query.status;
  const tasks = await Task.find(filter).populate(populate).sort({ dueDate: 1 });
  res.json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
  const ids = await visibleIds(req.user);
  if (!canSee(ids, req.body.assignee)) {
    res.status(403);
    throw new Error('You can only assign tasks to people you manage.');
  }
  const task = await Task.create({ ...req.body, status: 'todo', completedAt: null, createdBy: req.user._id });
  res.status(201).json(await task.populate(populate));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }
  const ids = await visibleIds(req.user);
  if (!canSee(ids, task.assignee)) {
    res.status(403);
    throw new Error('You do not have access to this task.');
  }
  // employees can only move their own tasks between statuses
  const editable = req.user.role === 'employee' ? ['status'] : ['title', 'description', 'category', 'priority', 'status', 'dueDate', 'assignee'];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  });
  if (req.body.status) task.completedAt = req.body.status === 'done' ? new Date() : null;
  await task.save();
  res.json(await task.populate(populate));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }
  const ids = await visibleIds(req.user);
  if (!canSee(ids, task.assignee)) {
    res.status(403);
    throw new Error('You do not have access to this task.');
  }
  await task.deleteOne();
  res.json({ message: 'Task deleted.' });
});
