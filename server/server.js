const express = require("express")
const cors = require("cors")
const connectDB = require("./data/config/db")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Log environment variables (without values)
console.log("Environment variables available:", Object.keys(process.env).join(", "))
console.log("BLOB_READ_WRITE_TOKEN exists:", !!process.env.BLOB_READ_WRITE_TOKEN)
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI)

// Basic test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working correctly",
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      BLOB_TOKEN_EXISTS: !!process.env.BLOB_READ_WRITE_TOKEN,
      MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
    },
  })
})

// Import and use API routes
try {
  const apiRoutes = require("./routes/api")
  app.use("/api", apiRoutes)
  console.log("API routes loaded successfully")
} catch (error) {
  console.error("Failed to load API routes:", error.message)
}

// Import and use images route
try {
  const imagesRoutes = require("./routes/images")
  app.use("/api/images", imagesRoutes)
  console.log("Images routes loaded successfully")
} catch (error) {
  console.error("Failed to load images routes:", error.message)
}

// Import and use test-blob route
try {
  const testBlobRoutes = require("./routes/test-blob")
  app.use("/api/test-blob", testBlobRoutes)
  console.log("Test Blob routes loaded successfully")
} catch (error) {
  console.error("Failed to load test-blob routes:", error.message)
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Connect to MongoDB and start server
if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
      })
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err)
      process.exit(1)
    })
}

module.exports = app // Export for testing
