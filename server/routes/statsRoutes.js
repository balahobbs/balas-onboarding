import { Router } from 'express';
import { getStats } from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.get('/', protect, getStats);
export default r;
