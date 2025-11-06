const express = require('express');
const {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getNewsletterStats
} = require('../controllers/newsletterController');

const router = express.Router();

router.post('/subscribe', subscribeToNewsletter);
router.post('/unsubscribe', unsubscribeFromNewsletter);
router.get('/stats', getNewsletterStats);

module.exports = router;