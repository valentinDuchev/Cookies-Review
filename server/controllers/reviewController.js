const Review = require("../models/Review")
const Product = require("../models/Product")
const { put, del, list } = require("@vercel/blob")

// Helper function to update product ratings
const updateProductRatings = async (productId) => {
  try {
    // Get all reviews for this product
    const productReviews = await Review.find({ productId })

    // Update review count
    const reviewCount = productReviews.length

    // Update rating
    let rating = 0
    if (reviewCount > 0) {
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
      rating = Number.parseFloat((totalRating / reviewCount).toFixed(1))
    }

    // Update the product
    await Product.updateOne({ id: productId }, { $set: { rating, reviewCount } })
  } catch (error) {
    console.error(`Error updating product ratings: ${error}`)
  }
}

// Direct Blob storage functions - defined inline to avoid import issues
const uploadImageToBlob = async (file) => {
  console.log("uploadImageToBlob called with file:", file ? file.originalname : "no file")

  if (!file || !file.buffer) {
    throw new Error("Invalid file object")
  }

  // Generate a unique filename
  const filename = `review-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  const extension = file.originalname ? file.originalname.split(".").pop() : "jpg"
  const fullFilename = `${filename}.${extension}`

  console.log(`Preparing to upload file ${fullFilename} to Vercel Blob...`)

  // Check if BLOB_READ_WRITE_TOKEN is set
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN environment variable is not set")
    throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set")
  }

  console.log("BLOB_READ_WRITE_TOKEN is set, proceeding with upload...")

  try {
    // Upload to Vercel Blob
    const blob = await put(fullFilename, file.buffer, {
      access: "public",
      contentType: file.mimetype || "image/jpeg",
    })

    console.log(`Successfully uploaded to Vercel Blob: ${blob.url}`)

    // Return the URL and other metadata
    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: blob.size,
    }
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error)
    throw error
  }
}

const reviewController = {
  // Get reviews for a product with pagination, filtering, and sorting
  getProductReviews: async (req, res) => {
    try {
      const productId = Number(req.params.productId)
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const sortBy = req.query.sortBy || "highestRating" // Default sort by highest rating
      const filterRating = req.query.filterRating ? Number(req.query.filterRating) : null
      const onlyWithImages = req.query.onlyWithImages === "true"

      // Build filter query
      const filterQuery = { productId }

      // Apply star rating filter if specified
      if (filterRating !== null) {
        filterQuery.rating = filterRating
      }

      // Apply image filter if specified
      if (onlyWithImages) {
        filterQuery.image = { $ne: null }
      }

      // Build sort query
      let sortQuery = {}
      switch (sortBy) {
        case "highestRating":
          sortQuery = { rating: -1 }
          break
        case "lowestRating":
          sortQuery = { rating: 1 }
          break
        case "mostHelpful":
          // This is more complex with MongoDB - we'll sort by the length of helpfulEmails array
          sortQuery = { helpfulCount: -1 } // We'll add this field in the aggregation
          break
        case "date":
          // Default sort by date (newest first)
          sortQuery = { date: -1 }
          break
        default:
          sortQuery = { rating: -1 }
      }

      // Calculate pagination
      const skip = (page - 1) * limit

      // Get total count for pagination
      const totalReviews = await Review.countDocuments(filterQuery)
      const totalPages = Math.ceil(totalReviews / limit)

      // Get paginated reviews with sorting
      let reviews

      if (sortBy === "mostHelpful") {
        // Use aggregation for mostHelpful sorting
        reviews = await Review.aggregate([
          { $match: filterQuery },
          {
            $addFields: {
              helpfulCount: { $size: { $ifNull: ["$helpfulEmails", []] } },
              notHelpfulCount: { $size: { $ifNull: ["$notHelpfulEmails", []] } },
            },
          },
          { $sort: { helpfulCount: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              helpfulEmails: 0,
              notHelpfulEmails: 0,
            },
          },
        ])
      } else {
        // Regular find with sort
        reviews = await Review.find(filterQuery).sort(sortQuery).skip(skip).limit(limit)

        // Transform reviews to hide email arrays
        reviews = reviews.map((review) => {
          const reviewObj = review.toObject()
          return {
            ...reviewObj,
            helpfulCount: reviewObj.helpfulEmails ? reviewObj.helpfulEmails.length : 0,
            notHelpfulCount: reviewObj.notHelpfulEmails ? reviewObj.notHelpfulEmails.length : 0,
            helpfulEmails: undefined,
            notHelpfulEmails: undefined,
          }
        })
      }

      res.json({
        reviews,
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
      console.error("Error fetching reviews:", error)
      res.status(500).json({ message: error.message })
    }
  },

  // Add a new review for a product
  addProductReview: async (req, res) => {
    try {
      console.log("addProductReview called with body:", req.body)
      console.log("File included:", req.file ? "Yes" : "No")

      const productId = Number(req.params.productId)

      // Validate required fields
      const { name, email, rating, title, review } = req.body
      if (!name || !email || !rating || !title || !review) {
        return res.status(400).json({ message: "Missing required fields" })
      }

      // Check if the product exists
      const product = await Product.findOne({ id: productId })
      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      // Handle image upload if present
      let imageUrl = null
      if (req.file) {
        console.log("Uploading image to Blob storage...", req.file.originalname)
        try {
          // Use the inline function instead of importing
          const result = await uploadImageToBlob(req.file)
          imageUrl = result.url
          console.log("Image uploaded successfully:", imageUrl)
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError)
          return res.status(500).json({ message: "Failed to upload image", error: uploadError.message })
        }
      }

      // Get the next ID (highest ID + 1)
      const highestReview = await Review.findOne().sort("-id")
      const nextId = highestReview ? highestReview.id + 1 : 1

      // Create new review
      const newReview = new Review({
        id: nextId,
        productId,
        name,
        email,
        rating: Number(rating),
        title,
        review,
        date: new Date(),
        image: imageUrl, // Store the full URL from Blob storage
        helpfulEmails: [],
        notHelpfulEmails: [],
      })

      // Save the review
      await newReview.save()

      // Update product rating and review count
      await updateProductRatings(productId)

      // Transform review to hide email arrays in response
      const reviewResponse = newReview.toObject()
      delete reviewResponse.helpfulEmails
      delete reviewResponse.notHelpfulEmails
      reviewResponse.helpfulCount = 0
      reviewResponse.notHelpfulCount = 0

      // Respond with the review data
      res.status(201).json(reviewResponse)
    } catch (error) {
      console.error("Error adding review:", error)
      res.status(500).json({ message: "Failed to add review", error: error.message })
    }
  },

  // Mark a review as helpful
  markReviewHelpful: async (req, res) => {
    try {
      const reviewId = Number(req.params.reviewId)
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ message: "Email is required" })
      }

      // Find the review
      const review = await Review.findOne({ id: reviewId })
      if (!review) {
        return res.status(404).json({ message: "Review not found" })
      }

      // Initialize arrays if they don't exist
      if (!review.helpfulEmails) review.helpfulEmails = []
      if (!review.notHelpfulEmails) review.notHelpfulEmails = []

      // Check if email already marked this review as helpful
      if (review.helpfulEmails.includes(email)) {
        return res.status(400).json({
          message: "You have already marked this review as helpful",
          helpfulCount: review.helpfulEmails.length,
          notHelpfulCount: review.notHelpfulEmails.length,
          alreadyInteracted: true,
        })
      }

      // Check if email previously marked this review as not helpful
      const notHelpfulIndex = review.notHelpfulEmails.indexOf(email)
      if (notHelpfulIndex !== -1) {
        // Remove from not helpful list
        review.notHelpfulEmails.splice(notHelpfulIndex, 1)
      }

      // Add email to helpful list
      review.helpfulEmails.push(email)

      // Save changes
      await review.save()

      res.json({
        message: "Review marked as helpful",
        helpfulCount: review.helpfulEmails.length,
        notHelpfulCount: review.notHelpfulEmails.length,
        success: true,
      })
    } catch (error) {
      console.error("Error marking review as helpful:", error)
      res.status(500).json({ message: error.message })
    }
  },

  // Mark a review as not helpful
  markReviewNotHelpful: async (req, res) => {
    try {
      const reviewId = Number(req.params.reviewId)
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ message: "Email is required" })
      }

      // Find the review
      const review = await Review.findOne({ id: reviewId })
      if (!review) {
        return res.status(404).json({ message: "Review not found" })
      }

      // Initialize arrays if they don't exist
      if (!review.helpfulEmails) review.helpfulEmails = []
      if (!review.notHelpfulEmails) review.notHelpfulEmails = []

      // Check if email already marked this review as not helpful
      if (review.notHelpfulEmails.includes(email)) {
        return res.status(400).json({
          message: "You have already marked this review as not helpful",
          helpfulCount: review.helpfulEmails.length,
          notHelpfulCount: review.notHelpfulEmails.length,
          alreadyInteracted: true,
        })
      }

      // Check if email previously marked this review as helpful
      const helpfulIndex = review.helpfulEmails.indexOf(email)
      if (helpfulIndex !== -1) {
        // Remove from helpful list
        review.helpfulEmails.splice(helpfulIndex, 1)
      }

      // Add email to not helpful list
      review.notHelpfulEmails.push(email)

      // Save changes
      await review.save()

      res.json({
        message: "Review marked as not helpful",
        helpfulCount: review.helpfulEmails.length,
        notHelpfulCount: review.notHelpfulEmails.length,
        success: true,
      })
    } catch (error) {
      console.error("Error marking review as not helpful:", error)
      res.status(500).json({ message: error.message })
    }
  },

  // Check if an email has already interacted with a review
  checkReviewInteraction: async (req, res) => {
    try {
      const reviewId = Number(req.params.reviewId)
      const { email } = req.query

      if (!email) {
        return res.status(400).json({ message: "Email is required" })
      }

      // Find the review
      const review = await Review.findOne({ id: reviewId })
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
      console.error("Error checking review interaction:", error)
      res.status(500).json({ message: error.message })
    }
  },
}

module.exports = reviewController
