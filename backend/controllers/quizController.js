import Quiz from '../models/Quiz.js';

export const createQuiz = async (req, res) => {
  try {
    const { title, slug, description, theme, category, coverImage, questions, results } = req.body;
    const quiz = await Quiz.create({
      title,
      slug,
      description,
      theme,
      category,
      coverImage,
      author: req.user._id,
      questions: questions || [],
      results: results || []
    });
    res.status(201).json(quiz);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A quiz with this URL slug already exists.' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    // Check permission - must be published OR author
    if (!quiz.isPublished && quiz.author.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this quiz' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this quiz' });
    }

    const { title, slug, description, theme, category, coverImage, results, questions } = req.body;
    
    if (title !== undefined) quiz.title = title;
    if (slug !== undefined) quiz.slug = slug;
    if (description !== undefined) quiz.description = description;
    if (theme !== undefined) quiz.theme = theme;
    if (category !== undefined) quiz.category = category;
    if (coverImage !== undefined) quiz.coverImage = coverImage;
    if (results !== undefined) quiz.results = results;
    if (questions !== undefined) quiz.questions = questions;

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    quiz.isPublished = !quiz.isPublished;
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await quiz.deleteOne();
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exploreQuizzes = async (req, res) => {
  try {
    const { category, sort, q } = req.query;
    let query = { isPublished: true };
    if (category && category !== 'All') query.category = category;
    if (q) query.title = { $regex: q, $options: 'i' };

    let sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { views: -1, likes: -1 };
    if (sort === 'trending') sortObj = { shares: -1, views: -1 };

    const quizzes = await Quiz.find(query)
      .populate('author', 'username')
      .sort(sortObj)
      .limit(30);
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuizBySlug = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ slug: req.params.slug, isPublished: true }).populate('author', 'username');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    quiz.views += 1;
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const duplicateQuiz = async (req, res) => {
  try {
    const original = await Quiz.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Not found' });
    if (original.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const newQuizData = original.toObject();
    delete newQuizData._id;
    delete newQuizData.createdAt;
    delete newQuizData.updatedAt;
    newQuizData.title = `${newQuizData.title} (Copy)`;
    newQuizData.slug = `${newQuizData.slug}-${Date.now()}`;
    newQuizData.isPublished = false;
    newQuizData.views = 0;
    newQuizData.likes = 0;
    newQuizData.shares = 0;

    const cloned = await Quiz.create(newQuizData);
    res.status(201).json(cloned);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    quiz.likes += 1;
    await quiz.save();
    res.json({ likes: quiz.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const recordShare = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    quiz.shares += 1;
    await quiz.save();
    res.json({ shares: quiz.shares });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
