// Import any required modules
const fs = require("fs")
const path = require("path")

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

// Controller methods
const itemController = {
  // Get all items
  getAllItems: (req, res) => {
    try {
      const db = readDatabase()
      res.json(db.items)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  // Get a single item by ID
  getItemById: (req, res) => {
    try {
      const db = readDatabase()
      const item = db.items.find((item) => item.id === Number.parseInt(req.params.id))

      if (!item) {
        return res.status(404).json({ message: "Item not found" })
      }

      res.json(item)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  // Create a new item
  createItem: (req, res) => {
    try {
      const db = readDatabase()
      const newItem = {
        id: db.items.length + 1,
        ...req.body,
        createdAt: new Date().toISOString(),
      }

      db.items.push(newItem)
      writeDatabase(db)

      res.status(201).json(newItem)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  // Update an existing item
  updateItem: (req, res) => {
    try {
      const db = readDatabase()
      const index = db.items.findIndex((item) => item.id === Number.parseInt(req.params.id))

      if (index === -1) {
        return res.status(404).json({ message: "Item not found" })
      }

      db.items[index] = {
        ...db.items[index],
        ...req.body,
        updatedAt: new Date().toISOString(),
      }

      writeDatabase(db)

      res.json(db.items[index])
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  // Delete an item
  deleteItem: (req, res) => {
    try {
      const db = readDatabase()
      const filteredItems = db.items.filter((item) => item.id !== Number.parseInt(req.params.id))

      if (filteredItems.length === db.items.length) {
        return res.status(404).json({ message: "Item not found" })
      }

      db.items = filteredItems
      writeDatabase(db)

      res.json({ message: "Item deleted successfully" })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
}

module.exports = itemController
