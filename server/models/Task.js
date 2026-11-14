import mongoose from 'mongoose';
import { CATEGORIES } from '../utils/defaultTasks.js';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Task title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, enum: CATEGORIES, default: 'paperwork' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    completedAt: { type: Date, default: null },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
