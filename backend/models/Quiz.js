import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  image: { type: String, default: '' },
  scoreMap: {
    type: Map,
    of: Number,
    default: {}
  }
});

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  image: { type: String, default: '' },
  options: [optionSchema]
});

const resultSchema = new mongoose.Schema({
  key: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  coverImage: { type: String, default: '' },
  theme: { type: String, default: 'indigo' },
  category: { type: String, default: 'Personality' },
  isPublished: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  results: [resultSchema],
  questions: [questionSchema]
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
