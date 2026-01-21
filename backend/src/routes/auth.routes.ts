import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.model';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { JWTPayload } from '../middleware/auth.middleware';

const router = express.Router();

// Generate JWT token
const generateToken = (payload: JWTPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload as object, jwtSecret, { expiresIn } as jwt.SignOptions);
};

// Customer signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and user name are required' });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ name });
    if (existingUsername) {
      return res.status(400).json({ error: 'User name is already taken' });
    }

    // Create customer account
    const user = new User({
      email,
      password,
      name,
      role: UserRole.CUSTOMER,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Login (both customer and owner)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Protected route - owner only (example)
router.get('/admin/check', authenticate, requireRole(UserRole.OWNER), (req: Request, res: Response) => {
  res.json({ message: 'Owner access granted' });
});

// Update profile (name)
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user!.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'User name is required' });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({ name, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ error: 'User name is already taken' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Change password
router.put('/password', authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
