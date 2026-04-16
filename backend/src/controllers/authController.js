const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('Register attempt:', { email, role });
    
    if (!name || !email || !password) {
      console.warn('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ message: 'Missing fields: name, email, and password are required' });
    }
    
    const exists = await User.findOne({ email });
    if (exists) {
      console.warn('Email already in use:', email);
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    const user = await User.create({ name, email, password, role });
    console.log('✓ User registered:', { id: user._id, email: user.email });
    
    res.status(201).json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        profileImage: user.profileImage || null,
      }, 
      token: generateToken(user) 
    });
  } catch (err) {
    console.error('✗ Registration error:', err.message);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });
    
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const matched = await user.matchPassword(password);
    if (!matched) {
      console.warn('Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('✓ Login successful:', { id: user._id, email: user.email });
    
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        profileImage: user.profileImage || null,
      }, 
      token: generateToken(user) 
    });
  } catch (err) {
    console.error('✗ Login error:', err.message);
    next(err);
  }
};
