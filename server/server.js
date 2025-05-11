const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

// Import Shopify API
const Shopify = require("shopify-api-node")

// Import routes
const apiRoutes = require("./routes/api")

// Initialize Shopify client
const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  accessToken: process.env.ADMIN_API_ACCESS_TOKEN, // starts with shpat_
})

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Serve static files
app.use(express.static(path.join(__dirname, "public")))

// Routes
app.use("/api", apiRoutes)

// Sync products from Shopify to local DB
const syncShopifyProducts = async () => {
  try {
    console.log("Syncing products from Shopify...")

    // Get products from Shopify
    const products = await shopify.product.list({ limit: 50 })

    // Read current database
    const dbPath = path.join(__dirname, "data/db.json")
    let db = { products: [], reviews: [] }

    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf8")
      try {
        db = JSON.parse(data)
      } catch (parseError) {
        console.error("Error parsing db.json, creating new database:", parseError)
      }
    }

    // Transform Shopify products to our format
    const transformedProducts = products.map((product) => {
      // Get the first variant for price
      const variant = product.variants[0]

      return {
        id: product.id,
        name: product.title,
        price: Number.parseFloat(variant.price),
        description: product.body_html ? product.body_html.replace(/<[^>]*>?/gm, "").substring(0, 300) + "..." : "",
        image: product.image ? product.image.src : "/images/placeholder.jpg",
        rating: 0, // Will be calculated based on reviews
        reviewCount: 0, // Will be calculated based on reviews
        shopifyData: product, // Store the full Shopify data
      }
    })

    // Update products in DB
    db.products = transformedProducts

    // Calculate ratings and review counts
    if (db.reviews && db.reviews.length > 0) {
      // Create a map of product IDs to their reviews
      const reviewsByProduct = {}

      db.reviews.forEach((review) => {
        if (!reviewsByProduct[review.productId]) {
          reviewsByProduct[review.productId] = []
        }
        reviewsByProduct[review.productId].push(review)
      })

      // Update product ratings and review counts
      db.products.forEach((product) => {
        const productReviews = reviewsByProduct[product.id] || []
        product.reviewCount = productReviews.length

        if (productReviews.length > 0) {
          const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
          product.rating = Number.parseFloat((totalRating / productReviews.length).toFixed(1))
        }
      })
    }

    // Save updated DB - but only if we're not in development mode with nodemon
    if (process.env.NODE_ENV !== "development") {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8")
      console.log("Products synced and saved to database!")
    } else {
      console.log("Products synced but not saved to database (development mode)")
    }

    // Store in memory for development mode
    global.inMemoryDb = db

    return db.products
  } catch (error) {
    console.error("Error syncing products from Shopify:", error)
    throw error
  }
}

// Helper function to read the database (with in-memory fallback for development)
const readDatabase = () => {
  // If we're in development mode and have in-memory DB, use that
  if (process.env.NODE_ENV === "development" && global.inMemoryDb) {
    return global.inMemoryDb
  }

  // Otherwise read from file
  const dbPath = path.join(__dirname, "data/db.json")
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, "utf8")
    return JSON.parse(data)
  }
  return { products: [], reviews: [] }
}

// Initial sync on server start - with error handling
setTimeout(() => {
  syncShopifyProducts().catch((err) => {
    console.error("Initial product sync failed:", err)
  })
}, 5000) // Delay initial sync by 5 seconds to let server start properly

// Schedule periodic sync (every hour) - but not too frequent
const ONE_HOUR = 60 * 60 * 1000
setInterval(() => {
  syncShopifyProducts().catch((err) => {
    console.error("Scheduled product sync failed:", err)
  })
}, ONE_HOUR)

// Export the readDatabase function for use in controllers
module.exports.readDatabase = readDatabase

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API URL: http://localhost:${PORT}/api`)
})
