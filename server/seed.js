import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Task from './models/Task.js';
import { buildTasksFor } from './utils/defaultTasks.js';

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany({}), Task.deleteMany({})]);

const pw = 'password123';
const hr = await User.create({ name: 'Priya Raman', email: 'hr@onboardly.com', password: pw, role: 'hr', department: 'People Operations', jobTitle: 'HR Business Partner', startDate: daysAgo(900) });
const mgr = await User.create({ name: 'Daniel Okafor', email: 'manager@onboardly.com', password: pw, role: 'manager', department: 'Engineering', jobTitle: 'Engineering Manager', startDate: daysAgo(700) });

const hires = [
  { name: 'Aria Lindqvist', email: 'aria@onboardly.com', jobTitle: 'Frontend Developer', ago: 45, doneRatio: 0.7 },
  { name: 'Mateo Alvarez', email: 'mateo@onboardly.com', jobTitle: 'Backend Developer', ago: 20, doneRatio: 0.45 },
  { name: 'Sana Iqbal', email: 'sana@onboardly.com', jobTitle: 'QA Engineer', ago: 6, doneRatio: 0.25 },
  { name: 'Leo Fischer', email: 'leo@onboardly.com', jobTitle: 'DevOps Engineer', ago: -5, doneRatio: 0 },
];

for (const h of hires) {
  const user = await User.create({ name: h.name, email: h.email, password: pw, role: 'employee', department: 'Engineering', jobTitle: h.jobTitle, startDate: daysAgo(h.ago), manager: mgr._id });
  const tasks = buildTasksFor(user, hr._id);
  const now = new Date();
  // mark the earliest tasks as done according to doneRatio; start the next one
  const doneCount = Math.round(tasks.length * h.doneRatio);
  tasks.forEach((t, i) => {
    if (i < doneCount) {
      t.status = 'done';
      t.completedAt = new Date(Math.min(now, new Date(t.dueDate)));
    } else if (i === doneCount && h.doneRatio > 0) {
      t.status = 'in_progress';
    }
  });
  await Task.insertMany(tasks);
}

console.log('Seeded. Demo logins (password: password123):');
console.log('  HR        hr@onboardly.com');
console.log('  Manager   manager@onboardly.com');
console.log('  Employee  aria@onboardly.com');
await mongoose.disconnect();
