import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.route('/').get(getTasks).post(authorize('hr', 'manager'), createTask);
r.route('/:id').patch(updateTask).delete(authorize('hr', 'manager'), deleteTask);
export default r;
