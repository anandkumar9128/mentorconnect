import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';

export const updateMentorProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.specialization = req.body.specialization || user.specialization;
    user.field = req.body.field || user.field;
    user.education = req.body.education || user.education;
    user.experience = req.body.experience || user.experience;
    user.hourlyRate = req.body.hourlyRate || user.hourlyRate;
    
    if (req.body.profilePhoto) {
      user.profilePhoto = req.body.profilePhoto;
    }
    
    if (req.body.socialMedia) {
      user.socialMedia = {
        ...user.socialMedia,
        ...req.body.socialMedia
      };
    }

    user.isProfileComplete = true;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isApproved: updatedUser.isApproved,
      isProfileComplete: updatedUser.isProfileComplete,
      hourlyRate: updatedUser.hourlyRate,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all mentors (with optional search)
// @route   GET /api/users/mentors
// @access  Private
export const getMentors = asyncHandler(async (req: Request, res: Response) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search as string, $options: 'i' } },
          { specialization: { $regex: req.query.search as string, $options: 'i' } },
        ],
      }
    : {};

  const mentors = await User.find({ 
    role: 'mentor', 
    isProfileComplete: true,
    ...keyword 
  }).select('-password'); // Exclude passwords

  res.json(mentors);
});
