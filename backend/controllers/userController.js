import User from '../models/User.js';
import Quiz from '../models/Quiz.js';

export const getUserProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Get their featured quizzes
    const publishedQuizzes = await Quiz.find({ author: user._id, isPublished: true }).sort({ createdAt: -1 });
    
    res.json({
      user,
      quizzes: publishedQuizzes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;
    
    await user.save();
    res.json({
      _id: user._id,
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
