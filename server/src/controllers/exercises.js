const Exercise = require('../models/Exercise');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Private
exports.getExercises = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    
    // Fields to exclude from filtering
    const excludeFields = ['select', 'sort', 'page', 'limit'];
    excludeFields.forEach(param => delete queryObj[param]);

    // Filter by user's custom exercises or public exercises
    queryObj.$or = [
      { user: req.user.id },
      { isCustom: false }
    ];

    // Create query string
    let queryStr = JSON.stringify(queryObj);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    let query = Exercise.find(JSON.parse(queryStr));

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
    const total = await Exercise.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const exercises = await query;

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
      count: exercises.length,
      pagination,
      data: exercises
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Private
exports.getExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return next(new ErrorResponse(`Exercise not found with id of ${req.params.id}`, 404));
    }

    // Make sure user can access this exercise (either it's their custom exercise or a public one)
    if (exercise.isCustom && exercise.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to access this exercise`, 401));
    }

    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new exercise
// @route   POST /api/exercises
// @access  Private
exports.createExercise = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add user to request body
    req.body.user = req.user.id;
    
    // Mark as custom exercise if created by user
    req.body.isCustom = true;

    const exercise = await Exercise.create(req.body);

    res.status(201).json({
      success: true,
      data: exercise
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private
exports.updateExercise = async (req, res, next) => {
  try {
    let exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return next(new ErrorResponse(`Exercise not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is exercise owner if it's a custom exercise
    if (exercise.isCustom && exercise.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to update this exercise`, 401));
    }

    // Don't allow updating public exercises
    if (!exercise.isCustom) {
      return next(new ErrorResponse(`Cannot update public exercises`, 401));
    }

    exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private
exports.deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return next(new ErrorResponse(`Exercise not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is exercise owner
    if (exercise.isCustom && exercise.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to delete this exercise`, 401));
    }

    // Don't allow deleting public exercises
    if (!exercise.isCustom) {
      return next(new ErrorResponse(`Cannot delete public exercises`, 401));
    }

    await exercise.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
}; 