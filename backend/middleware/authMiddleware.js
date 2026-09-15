const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET || 'asset_flow_default_production_secure_secret_2026';
      const decoded = jwt.verify(token, secret);

      // Attach user object to request (excluding password)
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Not a MongoDB ObjectID or MongoDB down
      }

      if (!req.user && decoded.id) {
        // Lookup in Supabase
        const { supabase } = require('../config/supabase');
        const { data: supaUser } = await supabase
          .from('users')
          .select('id, name, email, role, department')
          .eq('id', decoded.id)
          .single();

        if (supaUser) {
          req.user = {
            _id: supaUser.id,
            id: supaUser.id,
            name: supaUser.name,
            email: supaUser.email,
            role: supaUser.role,
            department: supaUser.department,
          };
        }
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided.',
    });
  }
};

module.exports = { protect };
