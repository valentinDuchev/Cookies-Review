const express = require("express")
const cors = require("cors")
const path = require("path")
const apiRoutes = require("./routes/api")
const imagesRoutes = require("./routes/images")
const connectDB = require("./config/db")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Set proper content type for API responses
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json")
  }
  next()
})

// Serve static files only in development
if (process.env.NODE_ENV !== "production") {
  app.use(express.static(path.join(__dirname, "public")))
}

// API routes
app.use("/api", apiRoutes)

// Images route
app.use("/api/images", imagesRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)

  // Always return JSON for API routes
  if (req.path.startsWith("/api")) {
    res.status(500).json({
      message: "Something went wrong!",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  } else {
    res.status(500).send("Server Error")
  }
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
