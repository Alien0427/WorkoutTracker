const express = require('express');
const {
  getProgressEntries,
  getProgressEntry,
  createProgressEntry,
  updateProgressEntry,
  deleteProgressEntry,
  getProgressStats
} = require('../controllers/progress');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get all progress entries for the logged in user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by end date
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (e.g. -date)
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
 *         description: List of progress entries
 *       401:
 *         description: Not authorized
 */
router.get('/', getProgressEntries);

/**
 * @swagger
 * /api/progress/stats:
 *   get:
 *     summary: Get progress statistics
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics (defaults to 30 days ago)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics (defaults to current date)
 *     responses:
 *       200:
 *         description: Progress statistics
 *       401:
 *         description: Not authorized
 */
router.get('/stats', getProgressStats);

/**
 * @swagger
 * /api/progress/{id}:
 *   get:
 *     summary: Get single progress entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Progress entry ID
 *     responses:
 *       200:
 *         description: Progress entry details
 *       404:
 *         description: Progress entry not found
 *       401:
 *         description: Not authorized
 */
router.get('/:id', getProgressEntry);

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Create a new progress entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               metrics:
 *                 type: object
 *                 properties:
 *                   weight:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                       unit:
 *                         type: string
 *                         enum: [kg, lb]
 *                   bodyFat:
 *                     type: number
 *                   measurements:
 *                     type: object
 *                     properties:
 *                       chest:
 *                         type: number
 *                       waist:
 *                         type: number
 *                       hips:
 *                         type: number
 *                       biceps:
 *                         type: number
 *                       thighs:
 *                         type: number
 *               personalRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     exercise:
 *                       type: string
 *                     value:
 *                       type: number
 *                     unit:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Progress entry created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
router.post('/', createProgressEntry);

/**
 * @swagger
 * /api/progress/{id}:
 *   put:
 *     summary: Update progress entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Progress entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               metrics:
 *                 type: object
 *               personalRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Progress entry updated
 *       404:
 *         description: Progress entry not found
 *       401:
 *         description: Not authorized
 */
router.put('/:id', updateProgressEntry);

/**
 * @swagger
 * /api/progress/{id}:
 *   delete:
 *     summary: Delete progress entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Progress entry ID
 *     responses:
 *       200:
 *         description: Progress entry deleted
 *       404:
 *         description: Progress entry not found
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', deleteProgressEntry);

module.exports = router; 