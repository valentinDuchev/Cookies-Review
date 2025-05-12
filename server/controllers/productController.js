const Product = require("../models/Product")
const Review = require("../models/Review")
const Shopify = require("shopify-api-node")

// Initialize Shopify client
const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  accessToken: process.env.ADMIN_API_ACCESS_TOKEN,
})

const productController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find()
      res.json(products)
    } catch (error) {
      console.error("Error fetching products:", error)
      res.status(500).json({ message: error.message })
    }
  },

  // Get a single product by ID
  getProductById: async (req, res) => {
    try {
      const productId = Number(req.params.id)

      // First check MongoDB
      let product = await Product.findOne({ id: productId })

      // If not found in MongoDB, try to fetch directly from Shopify
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
          const productReviews = await Review.find({ productId })
          product.reviewCount = productReviews.length

          if (productReviews.length > 0) {
            const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
            product.rating = Number.parseFloat((totalRating / productReviews.length).toFixed(1))
          }

          // Save the product to MongoDB for future requests
          await Product.create(product)
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
      console.log("Syncing products from Shopify...")

      // Get products from Shopify
      const products = await shopify.product.list({ limit: 50 })

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

      // Use bulkWrite to efficiently update or insert products
      const bulkOps = transformedProducts.map((product) => ({
        updateOne: {
          filter: { id: product.id },
          update: product,
          upsert: true,
        },
      }))

      await Product.bulkWrite(bulkOps)

      // Calculate ratings and review counts
      for (const product of transformedProducts) {
        const productReviews = await Review.find({ productId: product.id })
        const reviewCount = productReviews.length

        if (reviewCount > 0) {
          const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
          const avgRating = Number.parseFloat((totalRating / reviewCount).toFixed(1))

          await Product.updateOne(
            { id: product.id },
            {
              $set: {
                rating: avgRating,
                reviewCount: reviewCount,
              },
            },
          )
        }
      }

      const updatedCount = await Product.countDocuments()
      res.json({ message: "Products synced successfully", count: updatedCount })
    } catch (error) {
      console.error("Error syncing products:", error)
      res.status(500).json({ message: error.message })
    }
  },
}

module.exports = productController
