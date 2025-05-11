const express = require("express")
const router = express.Router()
const homeController = require("../controllers/homeController")

// Home routes
router.get("/", homeController.getHome)
router.get("/test", homeController.getTest)

module.exports = router
