const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Validate Email Route with timeout handling
router.post('/validate-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Add timeout to database operation
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), 9000)
    );

    const emailCheckPromise = User.findOne({ email });

    // Race between timeout and database query
    const existingUser = await Promise.race([
      emailCheckPromise,
      timeoutPromise
    ]);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email is available'
    });

  } catch (error) {
    console.error('Email validation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during validation'
    });
  }
});

module.exports = router;