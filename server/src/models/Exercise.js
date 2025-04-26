const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'sport', 'other']
  },
  muscleGroups: {
    type: [String],
    enum: [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 
      'quadriceps', 'hamstrings', 'calves', 'glutes', 'core', 'fullBody',
      'none'
    ]
  },
  equipmentNeeded: {
    type: String,
    enum: ['none', 'barbell', 'dumbbell', 'kettlebell', 'machine', 'cables', 'bands', 'bodyweight', 'other'],
    default: 'none'
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  instructions: {
    type: String,
    maxlength: [1000, 'Instructions cannot be more than 1000 characters']
  },
  imageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Exercise', ExerciseSchema); 