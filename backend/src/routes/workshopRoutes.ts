import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createWorkshop,
  getWorkshops,
  getMentorWorkshops,
  enrollWorkshop,
  getStudentWorkshops,
  completeWorkshop
} from '../controllers/workshopController';
import { upload } from '../utils/cloudinary';

const router = express.Router();

// Public routes
router.get('/', getWorkshops);

// Protected routes (Student/All authenticated users)
router.post('/:id/enroll', protect, enrollWorkshop);
router.get('/student', protect, getStudentWorkshops);

// Protected routes (Mentor only, checked in controller)
router.post('/', protect, upload.single('bannerImage'), createWorkshop);
router.get('/mentor', protect, getMentorWorkshops);
router.post('/:id/complete', protect, completeWorkshop);

export default router;
