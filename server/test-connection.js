const mongoose = require("mongoose")
require("dotenv").config()

// Print the connection string (with password masked)
const connectionString = process.env.MONGODB_URI || "Not defined"
const maskedString = connectionString.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, "mongodb+srv://$1:****@")
console.log("Connection string:", maskedString)

// Check if the connection string is using a placeholder
if (connectionString.includes("cluster.mongodb.net")) {
  console.error("ERROR: You're using a placeholder connection string!")
  console.error("Please replace it with your actual MongoDB Atlas connection string")
  process.exit(1)
}

// Try to connect
console.log("Attempting to connect to MongoDB...")
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB!")
    console.log(`Connected to: ${mongoose.connection.host}`)
    mongoose.connection.close()
    console.log("Connection closed")
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message)

    // Provide specific advice based on the error
    if (err.message.includes("ENOTFOUND")) {
      console.error("\nPossible causes:")
      console.error("1. Your cluster address is incorrect")
      console.error("2. You have network connectivity issues")
      console.error("3. Your VPN might be blocking the connection")
    } else if (err.message.includes("Authentication failed")) {
      console.error("\nAuthentication failed. Check your username and password.")
    }

    process.exit(1)
  })
