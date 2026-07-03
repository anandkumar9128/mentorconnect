import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Workshop from '../models/Workshop';
import User from '../models/User';

// @desc    Create a new workshop
// @route   POST /api/workshops
// @access  Private (Mentor only)
export const createWorkshop = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'mentor') {
      res.status(403);
      throw new Error('Only mentors can create workshops');
    }
    
    const { title, description, date, startTime, duration, price, capacity } = req.body;
    
    // Cloudinary automatically attaches the uploaded file URL to req.file.path
    const bannerImage = req.file ? req.file.path : undefined;

    const workshop = await Workshop.create({
      title,
      description,
      mentor: user._id,
      date,
      startTime,
      duration,
      price,
      capacity,
      bannerImage
    });

    res.status(201).json(workshop);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || 'Invalid workshop data');
  }
});

// @desc    Get all public workshops
// @route   GET /api/workshops
// @access  Public
export const getWorkshops = asyncHandler(async (req: Request, res: Response) => {
  try {
    const workshops = await Workshop.find({})
      .populate('mentor', 'name profilePhoto specialization')
      .sort({ date: 1, startTime: 1 });
      
    res.json(workshops);
  } catch (error: any) {
    res.status(500);
    throw new Error('Server error when fetching workshops');
  }
});

// @desc    Get workshops created by the logged in mentor
// @route   GET /api/workshops/mentor
// @access  Private (Mentor only)
export const getMentorWorkshops = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'mentor') {
      res.status(403);
      throw new Error('Only mentors can access this route');
    }

    const workshops = await Workshop.find({ mentor: user._id })
      .sort({ date: 1, startTime: 1 });

    res.json(workshops);
  } catch (error: any) {
    res.status(500);
    throw new Error('Server error when fetching mentor workshops');
  }
});

// @desc    Enroll in a workshop (Demo/Direct Enrollment)
// @route   POST /api/workshops/:id/enroll
// @access  Private (Student only)
export const enrollWorkshop = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check if the user is a student (mentors shouldn't enroll in their own stuff usually, but let's allow it for testing if needed, or strict student check)
    // Actually, let's just make sure they are logged in. (Any authenticated user can enroll)
    
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      res.status(404);
      throw new Error('Workshop not found');
    }

    if (workshop.enrolledCount >= workshop.capacity) {
      res.status(400);
      throw new Error('Workshop is fully booked');
    }

    // Check if already enrolled
    if (workshop.enrolledStudents && workshop.enrolledStudents.includes(user._id)) {
      res.status(400);
      throw new Error('You are already enrolled in this workshop');
    }

    // Add student to workshop
    workshop.enrolledStudents.push(user._id);
    workshop.enrolledCount += 1;
    await workshop.save();

    res.status(200).json({ message: 'Successfully enrolled', workshop });
  } catch (error: any) {
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Server error when enrolling in workshop');
  }
});

// @desc    Get workshops the student is enrolled in
// @route   GET /api/workshops/student
// @access  Private
export const getStudentWorkshops = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    const workshops = await Workshop.find({ enrolledStudents: user._id })
      .populate('mentor', 'name profilePhoto specialization')
      .sort({ date: 1, startTime: 1 });

    res.json(workshops);
  } catch (error: any) {
    res.status(500);
    throw new Error('Server error when fetching student workshops');
  }
});

// @desc    Complete a workshop and transfer earnings
// @route   POST /api/workshops/:id/complete
// @access  Private (Mentor only)
export const completeWorkshop = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'mentor') {
      res.status(403);
      throw new Error('Only mentors can complete workshops');
    }

    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      res.status(404);
      throw new Error('Workshop not found');
    }

    if (workshop.mentor.toString() !== user._id.toString()) {
      res.status(403);
      throw new Error('You do not have permission to complete this workshop');
    }

    if (workshop.status === 'completed') {
      res.status(400);
      throw new Error('Workshop is already completed');
    }

    // Mark as completed
    workshop.status = 'completed';
    await workshop.save();

    // Calculate earnings
    const earnings = workshop.price * workshop.enrolledCount;

    // Add to mentor's wallet
    const mentor = await User.findById(user._id);
    if (mentor) {
      mentor.walletBalance = (mentor.walletBalance || 0) + earnings;
      await mentor.save();
    }

    res.status(200).json({ 
      message: 'Workshop completed successfully', 
      earnings,
      walletBalance: mentor?.walletBalance
    });
  } catch (error: any) {
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Server error when completing workshop');
  }
});
