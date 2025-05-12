const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  productId: {
    type: Number,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
    default: null,
  },
  helpfulEmails: {
    type: [String],
    default: [],
  },
  notHelpfulEmails: {
    type: [String],
    default: [],
  },
})

module.exports = mongoose.model("Review", ReviewSchema)
