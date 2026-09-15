const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/logActivity');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role && ['admin', 'user'].includes(role) ? role : 'user',
    });

    const token = generateToken(user._id, user.role);

    // Record activity
    await logActivity({
      userId: user._id,
      userName: user.name,
      action: 'USER_REGISTER',
      details: `New account created with role '${user.role}'`,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const bcrypt = require('bcryptjs');
    const { supabase } = require('../config/supabase');

    // Validate input presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    // 1. Try finding in MongoDB (if connected)
    try {
      user = await User.findOne({ email: normalizedEmail }).select('+password');
    } catch (dbErr) {
      // MongoDB not available, fallback to Supabase
    }

    if (user) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials',
        });
      }

      const token = generateToken(user._id, user.role);

      await logActivity({
        userId: user._id,
        userName: user.name,
        action: 'USER_LOGIN',
        details: `Successful login from ${req.ip || 'web client'}`,
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token,
        },
      });
    }

    // 2. Fallback to Supabase Database
    try {
      const { data: supaUser, error: supaErr } = await supabase
        .from('users')
        .select('*')
        .ilike('email', normalizedEmail)
        .single();

      if (supaUser) {
        const isMatch = await bcrypt.compare(password, supaUser.password);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password credentials',
          });
        }

        const token = generateToken(supaUser.id, supaUser.role);

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            _id: supaUser.id,
            id: supaUser.id,
            name: supaUser.name,
            email: supaUser.email,
            role: supaUser.role,
            token,
          },
        });
      }
    } catch (supaErr) {
      console.warn('[Supabase Auth Warning]:', supaErr.message);
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password credentials',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (JWT Protected)
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
