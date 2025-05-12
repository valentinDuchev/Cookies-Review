const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const productController = require("../controllers/productController")
const reviewController = require("../controllers/reviewController")

// Configure multer for file uploads
const storage = multer.memoryStorage() // Use memory storage for flexibility
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Product routes
router.get("/products", productController.getAllProducts)
router.get("/products/:id", productController.getProductById)
router.get("/sync-products", productController.syncProducts)

// Review routes
router.get("/products/:productId/reviews", reviewController.getProductReviews)
router.post("/products/:productId/reviews", upload.single("image"), reviewController.addProductReview)
router.post("/reviews/:reviewId/helpful", reviewController.markReviewHelpful)
router.post("/reviews/:reviewId/not-helpful", reviewController.markReviewNotHelpful)
router.get("/reviews/:reviewId/interaction", reviewController.checkReviewInteraction)

module.exports = router
