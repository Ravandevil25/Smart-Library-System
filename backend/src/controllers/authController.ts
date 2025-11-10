import { Request, Response } from 'express';
import { AuthRequest } from '../utils/auth';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, rollNo, email, password, role = 'student' } = req.body;

    // Trim inputs to ensure consistency
    const trimmedRollNo = rollNo?.trim();
    const trimmedEmail = email?.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: trimmedEmail }, { rollNo: trimmedRollNo }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or roll number already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name: name?.trim(),
      rollNo: trimmedRollNo,
      email: trimmedEmail,
      password: hashedPassword,
      role
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user.id,
      rollNo: user.rollNo,
      role: user.role
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        rollNo: user.rollNo,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { rollNo, password } = req.body;

    // Validate input
    if (!rollNo || !password) {
      return res.status(400).json({ message: 'Roll number and password are required' });
    }

    // Trim rollNo to match schema behavior
    const trimmedRollNo = rollNo.trim();

    // Find user by roll number (try exact match first, then try with regex for flexibility)
    let user = await User.findOne({ rollNo: trimmedRollNo });
    
    // If not found with exact match, try case-insensitive regex match
    // This handles cases where user might have been registered with different casing/spacing
    if (!user) {
      user = await User.findOne({ 
        rollNo: { $regex: new RegExp(`^${trimmedRollNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }
    
    if (!user) {
      console.log(`Login failed: User not found with rollNo: ${trimmedRollNo}`);
      // Debug: Check what users exist (remove in production)
      const allUsers = await User.find({}, 'rollNo email name').limit(5);
      console.log(`Available users (sample):`, allUsers.map(u => ({ rollNo: u.rollNo, email: u.email })));
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for rollNo: ${trimmedRollNo}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      rollNo: user.rollNo,
      role: user.role
    });

    console.log(`Login successful for rollNo: ${trimmedRollNo}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        rollNo: user.rollNo,
        email: user.email,
        role: user.role,
        totalHours: user.totalHours,
        borrowedCount: user.borrowedCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      rollNo: user.rollNo,
      email: user.email,
      role: user.role,
      totalHours: user.totalHours,
      borrowedCount: user.borrowedCount,
      activeSessionId: user.activeSessionId || undefined,
      wishlist: user.wishlist || [],
      reserves: user.reserves || []
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};
