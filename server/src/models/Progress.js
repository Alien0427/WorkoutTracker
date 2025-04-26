const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  metrics: {
    weight: {
      value: {
        type: Number
      },
      unit: {
        type: String,
        enum: ['kg', 'lb'],
        default: 'kg'
      }
    },
    bodyFat: {
      type: Number, // percentage
    },
    measurements: {
      chest: {
        type: Number, // in cm
      },
      waist: {
        type: Number, // in cm
      },
      hips: {
        type: Number, // in cm
      },
      biceps: {
        type: Number, // in cm
      },
      thighs: {
        type: Number, // in cm
      }
    }
  },
  personalRecords: [{
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise'
    },
    value: {
      type: Number // Weight for strength, time for cardio, etc.
    },
    unit: {
      type: String,
      enum: ['kg', 'lb', 'seconds', 'minutes', 'meters', 'kilometers', 'miles']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Progress', ProgressSchema); 