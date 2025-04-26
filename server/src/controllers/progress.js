const Progress = require('../models/Progress');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

// @desc    Get all progress entries for the logged in user
// @route   GET /api/progress
// @access  Private
exports.getProgressEntries = async (req, res, next) => {
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
    let query = Progress.find(JSON.parse(queryStr)).populate({
      path: 'personalRecords.exercise',
      select: 'name category'
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
      query = query.sort('-date');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Progress.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const progressEntries = await query;

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
      count: progressEntries.length,
      pagination,
      data: progressEntries
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single progress entry
// @route   GET /api/progress/:id
// @access  Private
exports.getProgressEntry = async (req, res, next) => {
  try {
    const progressEntry = await Progress.findById(req.params.id).populate({
      path: 'personalRecords.exercise',
      select: 'name category'
    });

    if (!progressEntry) {
      return next(new ErrorResponse(`Progress entry not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the progress entry
    if (progressEntry.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to access this progress entry`, 401));
    }

    res.status(200).json({
      success: true,
      data: progressEntry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new progress entry
// @route   POST /api/progress
// @access  Private
exports.createProgressEntry = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add user to request body
    req.body.user = req.user.id;

    const progressEntry = await Progress.create(req.body);

    res.status(201).json({
      success: true,
      data: progressEntry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update progress entry
// @route   PUT /api/progress/:id
// @access  Private
exports.updateProgressEntry = async (req, res, next) => {
  try {
    let progressEntry = await Progress.findById(req.params.id);

    if (!progressEntry) {
      return next(new ErrorResponse(`Progress entry not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the progress entry
    if (progressEntry.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to update this progress entry`, 401));
    }

    progressEntry = await Progress.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: progressEntry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete progress entry
// @route   DELETE /api/progress/:id
// @access  Private
exports.deleteProgressEntry = async (req, res, next) => {
  try {
    const progressEntry = await Progress.findById(req.params.id);

    if (!progressEntry) {
      return next(new ErrorResponse(`Progress entry not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the progress entry
    if (progressEntry.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to delete this progress entry`, 401));
    }

    await progressEntry.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get progress statistics
// @route   GET /api/progress/stats
// @access  Private
exports.getProgressStats = async (req, res, next) => {
  try {
    // Get date range from query params or default to last 30 days
    const endDate = new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all entries in the date range for the user
    const entries = await Progress.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort('date');

    // Compile statistics
    const stats = {
      weightProgress: entries.map(entry => ({
        date: entry.date,
        weight: entry.metrics.weight ? entry.metrics.weight.value : null,
        unit: entry.metrics.weight ? entry.metrics.weight.unit : null
      })).filter(item => item.weight !== null),
      
      bodyFatProgress: entries.map(entry => ({
        date: entry.date,
        bodyFat: entry.metrics.bodyFat || null
      })).filter(item => item.bodyFat !== null),
      
      measurementsProgress: {
        chest: [],
        waist: [],
        hips: [],
        biceps: [],
        thighs: []
      },
      
      personalRecords: []
    };

    // Process measurements
    for (const entry of entries) {
      if (entry.metrics.measurements) {
        const date = entry.date;
        const measurements = entry.metrics.measurements;
        
        if (measurements.chest) {
          stats.measurementsProgress.chest.push({
            date,
            value: measurements.chest
          });
        }
        
        if (measurements.waist) {
          stats.measurementsProgress.waist.push({
            date,
            value: measurements.waist
          });
        }
        
        if (measurements.hips) {
          stats.measurementsProgress.hips.push({
            date,
            value: measurements.hips
          });
        }
        
        if (measurements.biceps) {
          stats.measurementsProgress.biceps.push({
            date,
            value: measurements.biceps
          });
        }
        
        if (measurements.thighs) {
          stats.measurementsProgress.thighs.push({
            date,
            value: measurements.thighs
          });
        }
      }
    }

    // Get all personal records and sort by date
    const allRecords = [];
    entries.forEach(entry => {
      if (entry.personalRecords && entry.personalRecords.length > 0) {
        entry.personalRecords.forEach(record => {
          allRecords.push({
            date: record.date || entry.date,
            exercise: record.exercise,
            value: record.value,
            unit: record.unit
          });
        });
      }
    });

    // Group records by exercise and get the maximum value for each
    const exerciseMap = {};
    allRecords.forEach(record => {
      const exerciseId = record.exercise._id || record.exercise;
      if (!exerciseMap[exerciseId] || record.value > exerciseMap[exerciseId].value) {
        exerciseMap[exerciseId] = record;
      }
    });

    // Convert map to array
    stats.personalRecords = Object.values(exerciseMap);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
}; 