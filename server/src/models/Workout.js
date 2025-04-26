const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
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
  exercises: [
    {
      exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
      },
      sets: [
        {
          setNumber: {
            type: Number,
            required: true
          },
          reps: {
            type: Number,
            required: function() {
              return this.exercise.category !== 'cardio';
            }
          },
          weight: {
            type: Number,
            required: function() {
              return this.exercise.category === 'strength';
            }
          },
          duration: {
            type: Number, // in seconds
            required: function() {
              return this.exercise.category === 'cardio' || this.exercise.category === 'flexibility';
            }
          },
          distance: {
            type: Number, // in meters
            required: function() {
              return this.exercise.category === 'cardio';
            }
          },
          restTime: {
            type: Number, // in seconds
            default: 60
          },
          completed: {
            type: Boolean,
            default: false
          },
          notes: {
            type: String,
            maxlength: [200, 'Notes cannot be more than 200 characters']
          }
        }
      ],
      notes: {
        type: String,
        maxlength: [200, 'Notes cannot be more than 200 characters']
      }
    }
  ],
  duration: {
    type: Number, // in minutes
    default: 0
  },
  schedule: {
    date: {
      type: Date
    },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    daysOfWeek: {
      type: [Number], // 0 for Sunday, 1 for Monday, etc.
      validate: {
        validator: function(v) {
          return v.every(day => day >= 0 && day <= 6);
        },
        message: 'Days of week must be between 0 and 6'
      }
    }
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total volume (weight × reps for all exercises)
WorkoutSchema.virtual('totalVolume').get(function() {
  let volume = 0;
  this.exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      if (set.weight && set.reps && set.completed) {
        volume += set.weight * set.reps;
      }
    });
  });
  return volume;
});

// Virtual for total completed sets
WorkoutSchema.virtual('completedSets').get(function() {
  let completed = 0;
  this.exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      if (set.completed) {
        completed += 1;
      }
    });
  });
  return completed;
});

// Calculate total sets
WorkoutSchema.virtual('totalSets').get(function() {
  let total = 0;
  this.exercises.forEach(exercise => {
    total += exercise.sets.length;
  });
  return total;
});

module.exports = mongoose.model('Workout', WorkoutSchema); 