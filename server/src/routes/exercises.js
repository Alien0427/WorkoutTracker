const express = require('express');
const { check } = require('express-validator');
const {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise
} = require('../controllers/exercises');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

/**
 * @swagger
 * /api/exercises:
 *   get:
 *     summary: Get all exercises (public and user's custom)
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: muscleGroups
 *         schema:
 *           type: string
 *         description: Filter by muscle group
 *       - in: query
 *         name: equipmentNeeded
 *         schema:
 *           type: string
 *         description: Filter by equipment
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
 *         description: List of exercises
 *       401:
 *         description: Not authorized
 */
router.get('/', getExercises);

/**
 * @swagger
 * /api/exercises/{id}:
 *   get:
 *     summary: Get single exercise
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
 *     responses:
 *       200:
 *         description: Exercise details
 *       404:
 *         description: Exercise not found
 *       401:
 *         description: Not authorized
 */
router.get('/:id', getExercise);

/**
 * @swagger
 * /api/exercises:
 *   post:
 *     summary: Create a new custom exercise
 *     tags: [Exercises]
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
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [strength, cardio, flexibility, balance, sport, other]
 *               muscleGroups:
 *                 type: array
 *                 items:
 *                   type: string
 *               equipmentNeeded:
 *                 type: string
 *               difficultyLevel:
 *                 type: string
 *               instructions:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Exercise created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty()
  ],
  createExercise
);

/**
 * @swagger
 * /api/exercises/{id}:
 *   put:
 *     summary: Update exercise
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
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
 *               category:
 *                 type: string
 *               muscleGroups:
 *                 type: array
 *                 items:
 *                   type: string
 *               equipmentNeeded:
 *                 type: string
 *               difficultyLevel:
 *                 type: string
 *               instructions:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exercise updated
 *       404:
 *         description: Exercise not found
 *       401:
 *         description: Not authorized
 */
router.put('/:id', updateExercise);

/**
 * @swagger
 * /api/exercises/{id}:
 *   delete:
 *     summary: Delete exercise
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
 *     responses:
 *       200:
 *         description: Exercise deleted
 *       404:
 *         description: Exercise not found
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', deleteExercise);

module.exports = router; 