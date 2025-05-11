const homeController = {
    // Home page
    getHome: (req, res) => {
      console.log("Root route accessed")
      res.json({ message: "Welcome to the API" })
    },
  
    // Test route
    getTest: (req, res) => {
      console.log("Test route accessed")
      res.send("Server is working!")
    },
  }
  
  module.exports = homeController
  