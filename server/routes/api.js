const express = require("express")
const router = express.Router()
const multer = require("multer")
const productController = require("../controllers/productController")
const reviewController = require("../controllers/reviewController")

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() })

// Product routes
router.get("/products", productController.getAllProducts)
router.get("/products/:id", productController.getProductById)
router.post("/products/sync", productController.syncProducts) // Force sync with Shopify

// Review routes
router.get("/products/:productId/reviews", reviewController.getProductReviews)
router.post("/products/:productId/reviews", upload.single("image"), reviewController.addProductReview)
router.post("/reviews/:reviewId/helpful", reviewController.markReviewHelpful)
router.post("/reviews/:reviewId/not-helpful", reviewController.markReviewNotHelpful)
router.get("/reviews/:reviewId/interaction", reviewController.checkReviewInteraction)

module.exports = router
