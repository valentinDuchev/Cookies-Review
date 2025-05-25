"use client"

import { useState } from "react"
import StarRating from "./StarRating"
import "./ReviewForm.css"

//productId, productName

function ReviewForm({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    title: "",
    review: "",
    image: null,
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleRatingChange = (rating) => {
    setFormData({
      ...formData,
      rating,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({
        ...formData,
        image: file,
      })

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (formData.rating === 0) {
      newErrors.rating = "Please select a rating"
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.review.trim()) {
      newErrors.review = "Review is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="review-form-modern">
      <div className="review-form-header">
        <h2>Leave a review</h2>
        <button className="close-button" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            className={errors.name ? "error" : ""}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">
            E-mail <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your e-mail"
            className={errors.email ? "error" : ""}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>
            Rating <span className="required">*</span>
          </label>
          <div className="rating-input">
            <StarRating rating={formData.rating} editable={true} onChange={handleRatingChange} />
          </div>
          {errors.rating && <span className="error-message">{errors.rating}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="title">
            Review title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter review title"
            className={errors.title ? "error" : ""}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="review">
            Review <span className="required">*</span>
          </label>
          <textarea
            id="review"
            name="review"
            value={formData.review}
            onChange={handleChange}
            rows="5"
            placeholder="Write your review"
            className={errors.review ? "error" : ""}
          ></textarea>
          {errors.review && <span className="error-message">{errors.review}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload a photo (optional)</label>
          <div className="image-upload-container">
            <label htmlFor="image" className="image-upload-label">
              <div className="image-upload-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <span>Browse</span>
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="image-upload-input"
            />
          </div>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview || "/placeholder.svg"} alt="Preview" />
              <button
                type="button"
                className="remove-image"
                onClick={() => {
                  setImagePreview(null)
                  setFormData({ ...formData, image: null })
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Submit review
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
