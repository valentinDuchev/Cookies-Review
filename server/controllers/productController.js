const fs = require("fs")
const path = require("path")
const Shopify = require("shopify-api-node")

// Initialize Shopify client
const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  accessToken: process.env.ADMIN_API_ACCESS_TOKEN,
})

// Path to our mock database
const dbPath = path.join(__dirname, "../data/db.json")

// Helper function to read the database
const readDatabase = () => {
  const data = fs.readFileSync(dbPath, "utf8")
  return JSON.parse(data)
}

// Helper function to write to the database
const writeDatabase = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8")
}

const productController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      // Read from local DB (which is synced with Shopify)
      const db = readDatabase()
      res.json(db.products)
    } catch (error) {
      console.error("Error fetching products:", error)
      res.status(500).json({ message: error.message })
    }
  },

  // Get a single product by ID
  getProductById: async (req, res) => {
    try {
      const productId = Number(req.params.id)

      // First check local DB
      const db = readDatabase()
      let product = db.products.find((p) => p.id === productId)

      // If not found in local DB, try to fetch directly from Shopify
      if (!product) {
        try {
          const shopifyProduct = await shopify.product.get(productId)

          // Transform to our format
          const variant = shopifyProduct.variants[0]
          product = {
            id: shopifyProduct.id,
            name: shopifyProduct.title,
            price: Number.parseFloat(variant.price),
            description: shopifyProduct.body_html.replace(/<[^>]*>?/gm, "").substring(0, 300) + "...",
            image: shopifyProduct.image ? shopifyProduct.image.src : "/images/placeholder.jpg",
            rating: 0,
            reviewCount: 0,
            shopifyData: shopifyProduct,
          }

          // Calculate rating and review count
          const productReviews = db.reviews.filter((r) => r.productId === productId)
          product.reviewCount = productReviews.length

          if (productReviews.length > 0) {
            const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
            product.rating = Number.parseFloat((totalRating / productReviews.length).toFixed(1))
          }
        } catch (shopifyError) {
          console.error("Error fetching product from Shopify:", shopifyError)
          return res.status(404).json({ message: "Product not found" })
        }
      }

      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      res.json(product)
    } catch (error) {
      console.error("Error fetching product:", error)
      res.status(500).json({ message: error.message })
    }
  },

  // Force sync products from Shopify
  syncProducts: async (req, res) => {
    try {
      // Get products from Shopify
      const products = await shopify.product.list({ limit: 50 })

      // Read current database
      const db = readDatabase()

      // Transform Shopify products to our format
      const transformedProducts = products.map((product) => {
        // Get the first variant for price
        const variant = product.variants[0]

        return {
          id: product.id,
          name: product.title,
          price: Number.parseFloat(variant.price),
          description: product.body_html.replace(/<[^>]*>?/gm, "").substring(0, 300) + "...",
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

      // Save updated DB
      writeDatabase(db)

      res.json({ message: "Products synced successfully", count: db.products.length })
    } catch (error) {
      console.error("Error syncing products:", error)
      res.status(500).json({ message: error.message })
    }
  },
}

module.exports = productController
