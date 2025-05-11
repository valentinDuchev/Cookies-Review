const fs = require("fs")
const path = require("path")
const { v4: uuidv4 } = require("uuid")

// Path to our mock database
const dbPath = path.join(__dirname, "../data/db.json")
const uploadDir = path.join(__dirname, "../public/images/reviews")

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Helper function to read the database with in-memory fallback
const readDatabase = () => {
  // If we're in development mode and have in-memory DB, use that
  if (process.env.NODE_ENV === "development" && global.inMemoryDb) {
    return global.inMemoryDb
  }

  // Otherwise read from file
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, "utf8")
    return JSON.parse(data)
  }
  return { products: [], reviews: [] }
}

// Helper function to write to the database
const writeDatabase = (data) => {
  // Store in memory for development mode
  if (process.env.NODE_ENV === "development") {
    global.inMemoryDb = data
    console.log("Data updated in memory (development mode)")
    return
  }

  // Otherwise write to file
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8")
}

// Helper function to update product ratings
const updateProductRatings = (db, productId) => {
  // Find the product
  const productIndex = db.products.findIndex((p) => p.id === productId)
  if (productIndex === -1) return

  // Get all reviews for this product
  const productReviews = db.reviews.filter((r) => r.productId === productId)

  // Update review count
  db.products[productIndex].reviewCount = productReviews.length

  // Update rating
  if (productReviews.length > 0) {
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
    db.products[productIndex].rating = Number.parseFloat((totalRating / productReviews.length).toFixed(1))
  } else {
    db.products[productIndex].rating = 0
  }
}

const reviewController = {
  // Get reviews for a product with pagination, filtering, and sorting
  getProductReviews: (req, res) => {
    try {
      const productId = Number(req.params.productId)
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const sortBy = req.query.sortBy || "highestRating" // Default sort by highest rating
      const filterRating = req.query.filterRating ? Number(req.query.filterRating) : null
      const onlyWithImages = req.query.onlyWithImages === "true"

      const db = readDatabase()

      // Filter reviews for the specific product
      let productReviews = db.reviews.filter((review) => review.productId === productId)

      // Apply star rating filter if specified
      if (filterRating !== null) {
        productReviews = productReviews.filter((review) => Math.round(review.rating) === filterRating)
      }

      // Apply image filter if specified
      if (onlyWithImages) {
        productReviews = productReviews.filter((review) => review.image !== null && review.image !== undefined)
      }

      // Sort reviews
      switch (sortBy) {
        case "highestRating":
          productReviews.sort((a, b) => b.rating - a.rating)
          break
        case "lowestRating":
          productReviews.sort((a, b) => a.rating - b.rating)
          break
        case "mostHelpful":
          productReviews.sort((a, b) => {
            const aHelpful = a.helpfulEmails ? a.helpfulEmails.length : 0
            const bHelpful = b.helpfulEmails ? b.helpfulEmails.length : 0
            return bHelpful - aHelpful
          })
          break
        case "date":
          // Default sort by date (newest first)
          productReviews.sort((a, b) => new Date(b.date) - new Date(a.date))
          break
        default:
          productReviews.sort((a, b) => b.rating - a.rating)
      }

      // Calculate pagination
      const startIndex = (page - 1) * limit
      const endIndex = page * limit

      // Get paginated reviews
      const paginatedReviews = productReviews.slice(startIndex, endIndex)

      // Calculate total pages
      const totalReviews = productReviews.length
      const totalPages = Math.ceil(totalReviews / limit)

      // Transform reviews to hide email arrays
      const transformedReviews = paginatedReviews.map((review) => {
        const { helpfulEmails, notHelpfulEmails, ...rest } = review
        return {
          ...rest,
          helpfulCount: review.helpfulEmails ? review.helpfulEmails.length : 0,
          notHelpfulCount: review.notHelpfulEmails ? review.notHelpfulEmails.length : 0,
        }
      })

      res.json({
        reviews: transformedReviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          filterRating,
          onlyWithImages,
          sortBy,
        },
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  // Add a new review for a product
  addProductReview: (req, res) => {
    try {
      const productId = Number(req.params.productId)
      const db = readDatabase()

      // Check if product exists
      const product = db.products.find((p) => p.id === productId)
      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      // Handle image upload if present
      let imagePath = null
      if (req.file) {
        const fileName = `review-${Date.now()}-${req.file.originalname}`
        const filePath = path.join(uploadDir, fileName)

        // Save the file
        fs.writeFileSync(filePath, req.file.buffer)

        // Store relative path in database
        imagePath = `/images/reviews/${fileName}`
      }

      // Create new review
      const newReview = {
        id: db.reviews.length > 0 ? Math.max(...db.reviews.map((r) => r.id)) + 1 : 1,
        productId,
        name: req.body.name,
        email: req.body.email,
        rating: Number(req.body.rating),
        title: req.body.title,
        review: req.body.review,
        date: new Date().toISOString(),
        image: imagePath,
        helpfulEmails: [], // Array to store emails of users who found this helpful
        notHelpfulEmails: [], // Array to store emails of users who found this not helpful
      }

      // Add review to database
      db.reviews.push(newReview)

      // Update product rating and review count
      updateProductRatings(db, productId)

      // Save changes
      writeDatabase(db)

      // Transform review to hide email arrays in response
      const { helpfulEmails, notHelpfulEmails, ...reviewResponse } = newReview
      reviewResponse.helpfulCount = 0
      reviewResponse.notHelpfulCount = 0

      res.status(201).json(reviewResponse)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  // Mark a review as helpful
  markReviewHelpful: (req, res) => {
    try {
      const reviewId = Number(req.params.reviewId)
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ message: "Email is required" })
      }

      const db = readDatabase()

      const reviewIndex = db.reviews.findIndex((r) => r.id === reviewId)
      if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found" })
      }

      // Initialize arrays if they don't exist
      if (!db.reviews[reviewIndex].helpfulEmails) {
        db.reviews[reviewIndex].helpfulEmails = []
      }
      if (!db.reviews[reviewIndex].notHelpfulEmails) {
        db.reviews[reviewIndex].notHelpfulEmails = []
      }

      // Check if email already marked this review as helpful
      if (db.reviews[reviewIndex].helpfulEmails.includes(email)) {
        return res.status(400).json({
          message: "You have already marked this review as helpful",
          helpfulCount: db.reviews[reviewIndex].helpfulEmails.length,
          notHelpfulCount: db.reviews[reviewIndex].notHelpfulEmails.length,
          alreadyInteracted: true,
        })
      }

      // Check if email previously marked this review as not helpful
      const notHelpfulIndex = db.reviews[reviewIndex].notHelpfulEmails.indexOf(email)
      if (notHelpfulIndex !== -1) {
        // Remove from not helpful list
        db.reviews[reviewIndex].notHelpfulEmails.splice(notHelpfulIndex, 1)
      }

      // Add email to helpful list
      db.reviews[reviewIndex].helpfulEmails.push(email)

      // Save changes
      writeDatabase(db)

      res.json({
        message: "Review marked as helpful",
        helpfulCount: db.reviews[reviewIndex].helpfulEmails.length,
        notHelpfulCount: db.reviews[reviewIndex].notHelpfulEmails.length,
        success: true,
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  // Mark a review as not helpful
  markReviewNotHelpful: (req, res) => {
    try {
      const reviewId = Number(req.params.reviewId)
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ message: "Email is required" })
      }

      const db = readDatabase()

      const reviewIndex = db.reviews.findIndex((r) => r.id === reviewId)
      if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found" })
      }

      // Initialize arrays if they don't exist
      if (!db.reviews[reviewIndex].helpfulEmails) {
        db.reviews[reviewIndex].helpfulEmails = []
      }
      if (!db.reviews[reviewIndex].notHelpfulEmails) {
        db.reviews[reviewIndex].notHelpfulEmails = []
      }

      // Check if email already marked this review as not helpful
      if (db.reviews[reviewIndex].notHelpfulEmails.includes(email)) {
        return res.status(400).json({
          message: "You have already marked this review as not helpful",
          helpfulCount: db.reviews[reviewIndex].helpfulEmails.length,
          notHelpfulCount: db.reviews[reviewIndex].notHelpfulEmails.length,
          alreadyInteracted: true,
        })
      }

      // Check if email previously marked this review as helpful
      const helpfulIndex = db.reviews[reviewIndex].helpfulEmails.indexOf(email)
      if (helpfulIndex !== -1) {
        // Remove from helpful list
        db.reviews[reviewIndex].helpfulEmails.splice(helpfulIndex, 1)
      }

      // Add email to not helpful list
      db.reviews[reviewIndex].notHelpfulEmails.push(email)

      // Save changes
      writeDatabase(db)

      res.json({
        message: "Review marked as not helpful",
        helpfulCount: db.reviews[reviewIndex].helpfulEmails.length,
        notHelpfulCount: db.reviews[reviewIndex].notHelpfulEmails.length,
        success: true,
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  // Check if an email has already interacted with a review
  checkReviewInteraction: (req, res) => {
    try {
      const reviewId = Number(req.params.reviewId)
      const { email } = req.query

      if (!email) {
        return res.status(400).json({ message: "Email is required" })
      }

      const db = readDatabase()

      const review = db.reviews.find((r) => r.id === reviewId)
      if (!review) {
        return res.status(404).json({ message: "Review not found" })
      }

      // Initialize arrays if they don't exist
      const helpfulEmails = review.helpfulEmails || []
      const notHelpfulEmails = review.notHelpfulEmails || []

      const hasLiked = helpfulEmails.includes(email)
      const hasDisliked = notHelpfulEmails.includes(email)

      res.json({
        hasInteracted: hasLiked || hasDisliked,
        interaction: hasLiked ? "helpful" : hasDisliked ? "notHelpful" : null,
        helpfulCount: helpfulEmails.length,
        notHelpfulCount: notHelpfulEmails.length,
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
}

module.exports = reviewController
