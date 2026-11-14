import User from '../models/User.js';
import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';
import { visibleIds, reportIds, progressFor } from '../utils/scope.js';

export const getStats = asyncHandler(async (req, res) => {
  const ids = await visibleIds(req.user);
  const tasks = await Task.find({ assignee: { $in: ids } }).lean();
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 86400000);
  const open = tasks.filter((t) => t.status !== 'done');
  const totals = {
    tasks: tasks.length,
    done: tasks.length - open.length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    overdue: open.filter((t) => new Date(t.dueDate) < now).length,
    dueSoon: open.filter((t) => new Date(t.dueDate) >= now && new Date(t.dueDate) <= soon).length,
  };
  totals.completion = totals.tasks ? Math.round((totals.done / totals.tasks) * 100) : 0;

  let people = [];
  if (req.user.role !== 'employee') {
    const rIds = await reportIds(req.user);
    const users = await User.find({ _id: { $in: rIds } }).select('name jobTitle department startDate').sort({ startDate: -1 }).lean();
    const progress = await progressFor(rIds);
    people = users.map((u) => ({ ...u, ...(progress[u._id] || { total: 0, done: 0, overdue: 0, percent: 0 }) }));
  }
  res.json({ totals, people });
});
