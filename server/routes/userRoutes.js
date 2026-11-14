import { Router } from 'express';
import { getUsers, getManagers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.get('/managers', authorize('hr'), getManagers);
r.route('/').get(authorize('hr', 'manager'), getUsers).post(authorize('hr'), createUser);
r.route('/:id').get(getUser).put(authorize('hr'), updateUser).delete(authorize('hr'), deleteUser);
export default r;
