import express from 'express';
import { getUserProfileByUsername, updateProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:username', getUserProfileByUsername);
router.put('/profile', protect, updateProfile);

export default router;
