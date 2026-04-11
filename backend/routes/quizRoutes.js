import express from 'express';
import {
  createQuiz,
  getMyQuizzes,
  getQuizById,
  updateQuiz,
  togglePublish,
  deleteQuiz,
  exploreQuizzes,
  getQuizBySlug,
  duplicateQuiz,
  toggleLike,
  recordShare
} from '../controllers/quizController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/explore', exploreQuizzes);
router.get('/slug/:slug', getQuizBySlug);
router.post('/:id/like', toggleLike);
router.post('/:id/share', recordShare);

// Protected routes
router.post('/', protect, createQuiz);
router.get('/my', protect, getMyQuizzes);
router.get('/:id', protect, getQuizById); // Can be public for published ones, but logic is handled in controller
router.put('/:id', protect, updateQuiz);
router.put('/:id/publish', protect, togglePublish);
router.delete('/:id', protect, deleteQuiz);
router.post('/:id/duplicate', protect, duplicateQuiz);

export default router;
