const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  analyzeMeeting, createMeeting, getMeetings, getMeeting,
  toggleActionItem, toggleUnresolved, deleteMeeting, getStats
} = require('../controllers/meetingController');

router.post('/analyze', protect, analyzeMeeting);
router.get('/stats/summary', protect, getStats);
router.route('/').get(protect, getMeetings).post(protect, createMeeting);
router.route('/:id').get(protect, getMeeting).delete(protect, deleteMeeting);
router.patch('/:id/action/:itemId', protect, toggleActionItem);
router.patch('/:id/unresolved/:itemId', protect, toggleUnresolved);

module.exports = router;
