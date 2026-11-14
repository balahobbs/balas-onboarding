import User from '../models/User.js';
import Task from '../models/Task.js';

// Which employees can this person see? HR sees everyone, managers see their reports.
export async function reportIds(user) {
  if (user.role === 'hr') return User.find({ role: 'employee' }).distinct('_id');
  if (user.role === 'manager') return User.find({ manager: user._id }).distinct('_id');
  return [];
}

export async function visibleIds(user) {
  const ids = await reportIds(user);
  return user.role === 'hr' ? ids : [...ids, user._id];
}

export const canSee = (ids, id) => ids.some((x) => String(x) === String(id));

// task totals per user: { [userId]: { total, done, overdue, percent } }
export async function progressFor(userIds) {
  const now = new Date();
  const rows = await Task.aggregate([
    { $match: { assignee: { $in: userIds } } },
    {
      $group: {
        _id: '$assignee',
        total: { $sum: 1 },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        overdue: { $sum: { $cond: [{ $and: [{ $ne: ['$status', 'done'] }, { $lt: ['$dueDate', now] }] }, 1, 0] } },
      },
    },
  ]);
  const map = {};
  rows.forEach((r) => {
    map[r._id] = { total: r.total, done: r.done, overdue: r.overdue, percent: r.total ? Math.round((r.done / r.total) * 100) : 0 };
  });
  return map;
}
