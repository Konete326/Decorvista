const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const Review = require('../models/Review');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get all user profiles (admin only)
const getAllUserProfiles = async (req, res, next) => {
  try {
    const profiles = await UserProfile.find()
      .populate('user', 'name email phone avatarUrl role')
      .populate('projectHistory.designer', 'user professionalTitle specialties')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile by user ID
const getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // First check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Try to find existing profile
    let profile = await UserProfile.findOne({ user: userId })
      .populate('user', 'name email phone avatarUrl')
      .populate('projectHistory.designer', 'user professionalTitle specialties');

    // If no profile exists, create a basic one with user data
    if (!profile) {
      profile = {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          avatarUrl: user.avatarUrl || user.profileImage || null
        },
        location: '',
        bio: '',
        preferredStyles: [],
        roomTypes: [],
        projectHistory: [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's profile
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatarUrl')
      .populate('projectHistory.designer', 'user professionalTitle specialties');

    if (!profile) {
      return res.json({
        success: false,
        data: null,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile (with image upload support)
const updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      name,
      bio,
      location,
      phone,
      preferredStyles,
      roomTypes,
      preferences,
      socialLinks
    } = req.body;

    // Check if user is updating their own profile or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    let profile = await UserProfile.findOne({ user: userId });
    let avatarUrl = null;

    // Handle profile image upload
    if (req.file) {
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `profile-${userId}-${Date.now()}${path.extname(req.file.originalname)}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, req.file.buffer);
      avatarUrl = `/uploads/${fileName}`;
    }

    // Update user's basic info
    const userUpdateData = {};
    if (name) userUpdateData.name = name;
    if (phone) userUpdateData.phone = phone;
    if (avatarUrl) userUpdateData.avatarUrl = avatarUrl;
    
    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdateData);
    }

    // Parse arrays if they come as strings (from FormData)
    const parsedPreferredStyles = typeof preferredStyles === 'string' 
      ? JSON.parse(preferredStyles) 
      : preferredStyles || [];
    const parsedRoomTypes = typeof roomTypes === 'string' 
      ? JSON.parse(roomTypes) 
      : roomTypes || [];

    if (profile) {
      // Update existing profile
      profile.bio = bio || profile.bio;
      profile.location = location || profile.location;
      profile.phone = phone || profile.phone;
      profile.preferredStyles = parsedPreferredStyles;
      profile.roomTypes = parsedRoomTypes;
      profile.preferences = preferences || profile.preferences;
      profile.socialLinks = socialLinks || profile.socialLinks;
      profile.profileCompleted = true;
      
      await profile.save();
    } else {
      // Create new profile
      profile = new UserProfile({
        user: userId,
        bio,
        location,
        phone,
        preferredStyles: parsedPreferredStyles,
        roomTypes: parsedRoomTypes,
        preferences,
        socialLinks,
        profileCompleted: true
      });
      
      await profile.save();
    }

    await profile.populate('user', 'name email phone avatarUrl');

    res.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create or update user profile (legacy method)
const createOrUpdateProfile = async (req, res, next) => {
  try {
    const {
      bio,
      location,
      preferences,
      socialLinks,
      avatarUrl
    } = req.body;

    let profile = await UserProfile.findOne({ user: req.user.id });

    // Update user's avatar if provided
    if (avatarUrl) {
      await User.findByIdAndUpdate(req.user.id, { avatarUrl });
    }

    if (profile) {
      // Update existing profile
      profile.bio = bio || profile.bio;
      profile.location = location || profile.location;
      profile.preferences = preferences || profile.preferences;
      profile.socialLinks = socialLinks || profile.socialLinks;
      profile.profileCompleted = true;
      
      await profile.save();
    } else {
      // Create new profile
      profile = new UserProfile({
        user: req.user.id,
        bio,
        location,
        preferences,
        socialLinks,
        profileCompleted: true
      });
      
      await profile.save();
    }

    await profile.populate('user', 'name email phone avatarUrl');

    res.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add project to history
const addProjectHistory = async (req, res, next) => {
  try {
    const {
      title,
      description,
      completedDate,
      designer,
      images,
      budget
    } = req.body;

    const profile = await UserProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    profile.projectHistory.push({
      title,
      description,
      completedDate,
      designer,
      images,
      budget
    });

    await profile.save();
    await profile.populate('projectHistory.designer', 'user professionalTitle specialties');

    res.json({
      success: true,
      data: profile,
      message: 'Project added to history'
    });
  } catch (error) {
    next(error);
  }
};

// Get user reviews (reviews about this user)
const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({
      targetType: 'user',
      targetId: userId,
      isVisible: true
    })
    .populate('author', 'name avatarUrl')
    .populate('consultation', 'slot status')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const totalReviews = await Review.countDocuments({
      targetType: 'user',
      targetId: userId,
      isVisible: true
    });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUserProfiles,
  getUserProfile,
  getMyProfile,
  createOrUpdateProfile,
  updateUserProfile,
  addProjectHistory,
  getUserReviews
};
