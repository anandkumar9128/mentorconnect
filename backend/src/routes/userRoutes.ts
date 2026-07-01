import express from 'express';
import { updateMentorProfile, getMentors } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.put('/profile', protect, updateMentorProfile);
router.get('/mentors', protect, getMentors);

export default router;
