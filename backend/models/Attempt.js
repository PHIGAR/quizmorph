import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for anonymous players
  resultKey: { type: String, required: true }, // The final calculated result
  selectedOptions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId },
    optionId: { type: mongoose.Schema.Types.ObjectId }
  }]
}, { timestamps: true });

const Attempt = mongoose.model('Attempt', attemptSchema);
export default Attempt;
