import express from 'express';
import Attempt from '../models/Attempt.js';
import Quiz from '../models/Quiz.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Optional auth. For MVP anyone can submit an attempt if we don't use 'protect'.
// Let's create a custom middleware to extract user if token exists, but not fail if it doesn't.
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {}
  }
  next();
};

router.post('/:quizId', optionalAuth, async (req, res) => {
  try {
    const { selectedOptions, resultKey } = req.body;
    
    // Minimal validation
    if (!resultKey) return res.status(400).json({ message: 'Result key required '});

    const attempt = await Attempt.create({
      quizId: req.params.quizId,
      userId: req.user?._id || null, // null for anonymous
      selectedOptions,
      resultKey
    });

    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
