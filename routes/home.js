const express = require('express')
const router = express.Router()

const { home, dummyCheck } = require('../controllers/homeController')

router.route('/').get(home)
router.route("/dummyCheck").get(dummyCheck);

module.exports = router
