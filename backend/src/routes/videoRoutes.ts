import express from 'express';
import { getVideoToken } from '../controllers/videoController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/token', protect, getVideoToken);

export default router;
