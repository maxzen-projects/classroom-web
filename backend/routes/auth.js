const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const profileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const getUploadedFile = (req, fieldName) => {
  const value = req.files?.[fieldName];
  return Array.isArray(value) ? value[0] : value;
};

const saveUploadedFile = async (file, folder, prefix) => {
  const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${prefix}-${Date.now()}-${safeName}`;
  const uploadDir = path.join(__dirname, '..', 'uploads', folder);
  const uploadPath = path.join(uploadDir, fileName);

  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(uploadPath, file.buffer);

  return `/uploads/${folder}/${fileName}`;
};

const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.trim();
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Basic payload validation
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, phone, password, and role' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please login or use a different email.' });
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = new User({ name, email: email.toLowerCase(), phone, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully! Please login with your credentials.' });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Mongoose validation error handling
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
    }
    
    res.status(500).json({ message: error.message || 'An error occurred during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const emailRegex = new RegExp(`^${escapeRegExp(normalizedEmail)}$`, 'i');

    // Find user and explicitly select password (case-insensitive email match)
    const user = await User.findOne({ email: emailRegex }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active and account is active
    if (user.isActive === false || (user.accountStatus && user.accountStatus !== 'active')) {
      return res.status(400).json({ message: 'Account is inactive or suspended' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        profileImage: user.profileImage,
        classId: user.classId,
        class: user.class,
        schoolId: user.schoolId,
        school: user.school
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let progressPercentage = 0;
    let totalStudents = 0;

    const profileData = {
      ...user.toObject(),
      progressPercentage,
      totalStudents,
      joinedDate: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile by ID
const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let progressPercentage = 0;

    const profileData = {
      ...user.toObject(),
      progressPercentage,
      joinedDate: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedFields = [
      'name', 'phone', 'bio', 'gender', 'dateOfBirth', 'address', 'city', 'state', 'country', 'pincode',
      'parentName', 'parentPhone', 'schoolCollege', 'classStandard', 'stream',
      'qualification', 'specialization', 'experience', 'skills', 'subjectsTeaching', 'certifications', 'linkedin',
      'department'
    ];

    // Handle profile image upload
    const profileImage = getUploadedFile(req, 'profileImage');
    if (profileImage) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(profileImage.mimetype)) {
        return res.status(400).json({ message: 'Invalid image type. Only JPEG, PNG, and GIF are allowed' });
      }

      if (profileImage.size > maxSize) {
        return res.status(400).json({ message: 'Image size too large. Maximum 5MB allowed' });
      }

      req.body.profileImage = await saveUploadedFile(profileImage, 'profiles', 'profile');
      allowedFields.push('profileImage');
    }

    // Handle resume upload for teachers
    const resume = getUploadedFile(req, 'resume');
    if (resume && user.role === 'teacher') {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(resume.mimetype)) {
        return res.status(400).json({ message: 'Invalid resume type. Only PDF and DOC files are allowed' });
      }

      if (resume.size > maxSize) {
        return res.status(400).json({ message: 'Resume size too large. Maximum 10MB allowed' });
      }

      req.body.resume = await saveUploadedFile(resume, 'resumes', 'resume');
      allowedFields.push('resume');
    }

    // Update only allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update user profile by ID
const updateProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedFields = [
      'name', 'phone', 'bio', 'gender', 'dateOfBirth', 'address', 'city', 'state', 'country', 'pincode',
      'parentName', 'parentPhone', 'schoolCollege', 'classStandard', 'stream'
    ];

    // Handle profile image upload
    const profileImage = getUploadedFile(req, 'profileImage');
    if (profileImage) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(profileImage.mimetype)) {
        return res.status(400).json({ message: 'Invalid image type. Only JPEG, PNG, and GIF are allowed' });
      }

      if (profileImage.size > maxSize) {
        return res.status(400).json({ message: 'Image size too large. Maximum 5MB allowed' });
      }

      req.body.profileImage = await saveUploadedFile(profileImage, 'profiles', 'profile');
      allowedFields.push('profileImage');
    }

    // Update only allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

const sendResetEmail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Verify connection
  try {
    await transporter.verify();
  } catch (error) {
    throw new Error(`Email service verification failed: ${error.message}`);
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: normalizedEmail.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email address' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click the link to reset your password:\n\n${resetUrl}`;

    // Attempt to send email but don't fail the request if it fails
    let emailSent = false;
    let emailError = null;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendResetEmail({
          to: user.email,
          subject: 'Password Reset Request - Classroom LMS',
          text: message,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>You requested a password reset for your Classroom LMS account.</p>
              <p>Click the link below to reset your password:</p>
              <p style="margin: 20px 0;">
                <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
              </p>
              <p><strong>Reset Link:</strong> ${resetUrl}</p>
              <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes for security reasons.</p>
              <p style="color: #666; font-size: 14px;">If you didn't request this reset, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">Classroom LMS Team</p>
            </div>
          `
        });
        emailSent = true;
      } catch (error) {
        console.error('Error sending password reset email:', error.message);
        emailError = error.message;
        // Email failed but we still return success since token was saved
      }
    }

    const responseMessage = emailSent
      ? 'Password reset link sent to your email'
      : emailError
        ? `Password reset link generated but email failed: ${emailError}`
        : 'Password reset link generated (email not configured)';

    return res.json({
      success: true,
      message: responseMessage,
      resetUrl, // For development/testing purposes
      emailSent,
      emailError: emailError ? emailError : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message || 'Failed to process forgot password request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Failed to reset password' });
  }
};

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', require('../middleware/authMiddleware'), getProfile);
router.get('/profile/:id', require('../middleware/authMiddleware'), getProfileById);
router.put(
  '/profile',
  require('../middleware/authMiddleware'),
  profileUpload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]),
  updateProfile
);
router.put(
  '/profile/:id',
  require('../middleware/authMiddleware'),
  profileUpload.fields([{ name: 'profileImage', maxCount: 1 }]),
  updateProfileById
);

module.exports = router;
