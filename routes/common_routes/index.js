const express = require('express');
const { check_auth_controller, renew_token_controller, logout_controller } = require('../../controllers/auth_controllers');
const router = express.Router()



router.get('/check-auth', check_auth_controller)
router.post('/renew-token', renew_token_controller)
router.post('/logout', logout_controller)






module.exports = router