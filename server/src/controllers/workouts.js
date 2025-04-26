const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

// @desc    Get all workouts for the logged in user
// @route   GET /api/workouts
// @access  Private
exports.getWorkouts = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    
    // Fields to exclude from filtering
    const excludeFields = ['select', 'sort', 'page', 'limit'];
    excludeFields.forEach(param => delete queryObj[param]);
    
    // Add user filter
    queryObj.user = req.user.id;

    // Create query string
    let queryStr = JSON.stringify(queryObj);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    let query = Workout.find(JSON.parse(queryStr)).populate({
      path: 'exercises.exercise',
      select: 'name category muscleGroups equipmentNeeded'
    });

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Workout.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const workouts = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: workouts.length,
      pagination,
      data: workouts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
exports.getWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id).populate({
      path: 'exercises.exercise',
      select: 'name category muscleGroups equipmentNeeded'
    });

    if (!workout) {
      return next(new ErrorResponse(`Workout not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the workout
    if (workout.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to access this workout`, 401));
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
exports.createWorkout = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add user to request body
    req.body.user = req.user.id;

    // Validate that all exercises exist and are accessible to the user
    if (req.body.exercises && req.body.exercises.length > 0) {
      const exerciseIds = req.body.exercises.map(ex => ex.exercise);
      const exercises = await Exercise.find({
        _id: { $in: exerciseIds },
        $or: [
          { user: req.user.id },
          { isCustom: false }
        ]
      });

      // Check if all exercises were found
      if (exercises.length !== exerciseIds.length) {
        return next(new ErrorResponse(`One or more exercises not found or not accessible`, 404));
      }
    }

    const workout = await Workout.create(req.body);

    res.status(201).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
exports.updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return next(new ErrorResponse(`Workout not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the workout
    if (workout.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to update this workout`, 401));
    }

    // Validate that all exercises exist and are accessible to the user
    if (req.body.exercises && req.body.exercises.length > 0) {
      const exerciseIds = req.body.exercises.map(ex => ex.exercise);
      const exercises = await Exercise.find({
        _id: { $in: exerciseIds },
        $or: [
          { user: req.user.id },
          { isCustom: false }
        ]
      });

      // Check if all exercises were found
      if (exercises.length !== exerciseIds.length) {
        return next(new ErrorResponse(`One or more exercises not found or not accessible`, 404));
      }
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return next(new ErrorResponse(`Workout not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the workout
    if (workout.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to delete this workout`, 401));
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle workout completion status
// @route   PUT /api/workouts/:id/complete
// @access  Private
exports.toggleWorkoutComplete = async (req, res, next) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return next(new ErrorResponse(`Workout not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the workout
    if (workout.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to update this workout`, 401));
    }

    // Toggle completion status
    workout.isCompleted = !workout.isCompleted;
    await workout.save();

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
}; 