const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');

router.get('/:id', invitationController.getInvitation);
router.post('/:id/reject', invitationController.rejectInvitation);
router.post('/:id/accept', invitationController.acceptInvitation);

module.exports = router;
