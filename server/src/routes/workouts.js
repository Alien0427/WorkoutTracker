const express = require('express');
const { check } = require('express-validator');
const {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  toggleWorkoutComplete
} = require('../controllers/workouts');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

/**
 * @swagger
 * /api/workouts:
 *   get:
 *     summary: Get all workouts for the logged in user
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isTemplate
 *         schema:
 *           type: boolean
 *         description: Filter by template status
 *       - in: query
 *         name: isCompleted
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (e.g. name,-createdAt)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of workouts
 *       401:
 *         description: Not authorized
 */
router.get('/', getWorkouts);

/**
 * @swagger
 * /api/workouts/{id}:
 *   get:
 *     summary: Get single workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout details
 *       404:
 *         description: Workout not found
 *       401:
 *         description: Not authorized
 */
router.get('/:id', getWorkout);

/**
 * @swagger
 * /api/workouts:
 *   post:
 *     summary: Create a new workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     exercise:
 *                       type: string
 *                     sets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           setNumber:
 *                             type: number
 *                           reps:
 *                             type: number
 *                           weight:
 *                             type: number
 *                           duration:
 *                             type: number
 *                           distance:
 *                             type: number
 *                           restTime:
 *                             type: number
 *                           notes:
 *                             type: string
 *               duration:
 *                 type: number
 *               schedule:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   recurrence:
 *                     type: string
 *                     enum: [none, daily, weekly, monthly]
 *                   daysOfWeek:
 *                     type: array
 *                     items:
 *                       type: number
 *               isTemplate:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Workout created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty()
  ],
  createWorkout
);

/**
 * @swagger
 * /api/workouts/{id}:
 *   put:
 *     summary: Update workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *               duration:
 *                 type: number
 *               schedule:
 *                 type: object
 *               isTemplate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Workout updated
 *       404:
 *         description: Workout not found
 *       401:
 *         description: Not authorized
 */
router.put('/:id', updateWorkout);

/**
 * @swagger
 * /api/workouts/{id}:
 *   delete:
 *     summary: Delete workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout deleted
 *       404:
 *         description: Workout not found
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', deleteWorkout);

/**
 * @swagger
 * /api/workouts/{id}/complete:
 *   put:
 *     summary: Toggle workout completion status
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout completion status toggled
 *       404:
 *         description: Workout not found
 *       401:
 *         description: Not authorized
 */
router.put('/:id/complete', toggleWorkoutComplete);

module.exports = router; 