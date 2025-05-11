"use client"

import { useState, useEffect } from "react"
import StarRating from "./StarRating"
import ReviewList from "./ReviewList"
import ReviewForm from "./ReviewForm"
import ReviewFilters from "./ReviewFilters"
import "./ProductDetail.css"

function ProductDetail({ product, onBack }) {
  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState(product.image)
  const [filters, setFilters] = useState({
    filterRating: null,
    sortBy: "highestRating",
    onlyWithImages: false,
  })
  const [starCounts, setStarCounts] = useState({})

  useEffect(() => {
    fetchReviews(currentPage, filters)
  }, [product.id, currentPage, filters])

  // Set the main image when product changes
  useEffect(() => {
    setSelectedImage(product.image)
  }, [product])

  const fetchReviews = async (page, filterOptions) => {
    try {
      setLoading(true)

      // Build query parameters
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        sortBy: filterOptions.sortBy,
      })

      if (filterOptions.filterRating !== null) {
        queryParams.append("filterRating", filterOptions.filterRating)
      }

      if (filterOptions.onlyWithImages) {
        queryParams.append("onlyWithImages", "true")
      }

      const response = await fetch(`http://localhost:5000/api/products/${product.id}/reviews?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch reviews")
      }

      const data = await response.json()
      setReviews(data.reviews)
      setPagination(data.pagination)
      setLoading(false)

      // If this is the first page or we're changing filters, fetch star counts
      if (page === 1 || Object.keys(starCounts).length === 0) {
        fetchStarCounts()
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setLoading(false)
    }
  }

  const fetchStarCounts = async () => {
    try {
      // Fetch all reviews without pagination to count stars
      const response = await fetch(`http://localhost:5000/api/products/${product.id}/reviews?limit=1000`)

      if (!response.ok) {
        throw new Error("Failed to fetch reviews for star counts")
      }

      const data = await response.json()
      const allReviews = data.reviews

      // Count reviews by star rating
      const counts = {}
      for (let i = 1; i <= 5; i++) {
        counts[i] = allReviews.filter((review) => Math.round(review.rating) === i).length
      }

      setStarCounts(counts)
    } catch (error) {
      console.error("Error fetching star counts:", error)
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleReviewSubmit = async (reviewData) => {
    try {
      const formData = new FormData()

      // Append text fields
      Object.keys(reviewData).forEach((key) => {
        if (key !== "image") {
          formData.append(key, reviewData[key])
        }
      })

      // Append image if exists
      if (reviewData.image) {
        formData.append("image", reviewData.image)
      }

      const response = await fetch(`http://localhost:5000/api/products/${product.id}/reviews`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }

      // Refresh reviews
      fetchReviews(1, filters)
      setCurrentPage(1)
      setShowReviewForm(false)

      // Refresh star counts
      fetchStarCounts()
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const handleHelpfulClick = (reviewId, helpfulCount, notHelpfulCount) => {
    // Update the review counts in the local state
    setReviews(
      reviews.map((review) => (review.id === reviewId ? { ...review, helpfulCount, notHelpfulCount } : review)),
    )
  }

  const handleNotHelpfulClick = (reviewId, helpfulCount, notHelpfulCount) => {
    // Update the review counts in the local state
    setReviews(
      reviews.map((review) => (review.id === reviewId ? { ...review, helpfulCount, notHelpfulCount } : review)),
    )
  }

  // Function to create HTML from product description
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent }
  }

  // Handle thumbnail click
  const handleThumbnailClick = (imageSrc) => {
    setSelectedImage(imageSrc)
  }

  // Get additional images from Shopify data
  const getAdditionalImages = () => {
    if (product.shopifyData && product.shopifyData.images && product.shopifyData.images.length > 1) {
      return product.shopifyData.images
    }
    return []
  }

  const additionalImages = getAdditionalImages()

  // Calculate total reviews for fractions
  const totalReviews = pagination ? pagination.totalReviews : 0

  return (
    <div className="product-detail">
      <button className="back-button" onClick={onBack}>
        &larr; Back to Products
      </button>

      <div className="product-container">
        <div className="product-image-section">
          <div className="product-image-container">
            <img src={selectedImage || "/placeholder.svg"} alt={product.name} className="product-image" />
          </div>

          {additionalImages.length > 1 && (
            <div className="product-thumbnails">
              {additionalImages.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === image.src ? "active" : ""}`}
                  onClick={() => handleThumbnailClick(image.src)}
                >
                  <img src={image.src || "/placeholder.svg"} alt={`${product.name} - view ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">${product.price.toFixed(2)}</p>

          <div className="product-rating-container">
            <StarRating rating={product.rating} />
            <span className="review-count">
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Use the full HTML description if available */}
          {product.shopifyData && product.shopifyData.body_html ? (
            <div
              className="product-description"
              dangerouslySetInnerHTML={createMarkup(product.shopifyData.body_html)}
            ></div>
          ) : (
            <p className="product-description">{product.description}</p>
          )}

          {/* <button className="write-review-button" onClick={() => setShowReviewForm(true)}>
            Write a Review
          </button> */}
        </div>
      </div>

      <div className="reviews-section">
        <div className="reviews-header">
          <h2>Customer reviews</h2>
          <button className="write-review-button" onClick={() => setShowReviewForm(true)}>
            Leave a review
          </button>
        </div>

        <div className="reviews-summary">
          <div className="overall-rating">
            <div className="stars-display">
              <StarRating rating={product.rating} />
            </div>
            <div className="rating-number">{product.rating.toFixed(1)}</div>
            <div className="review-count-text">Based on {product.reviewCount} reviews</div>
          </div>

          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars] || 0
              const percentage = product.reviewCount > 0 ? (count / product.reviewCount) * 100 : 0

              return (
                <div key={stars} className="rating-bar-row">
                  <div className="stars-display-fixed">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`star ${i < stars ? "filled" : "empty"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="rating-bar">
                    <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="rating-count">
                    {count}/{product.reviewCount}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <ReviewFilters onFilterChange={handleFilterChange} totalReviews={totalReviews} starCounts={starCounts} />

        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <ReviewList
            reviews={reviews}
            pagination={pagination}
            onPageChange={handlePageChange}
            onHelpfulClick={handleHelpfulClick}
            onNotHelpfulClick={handleNotHelpfulClick}
          />
        ) : (
          <div className="no-reviews-message">
            No reviews match your current filters.{" "}
            <button
              onClick={() =>
                handleFilterChange({
                  filterRating: null,
                  sortBy: "highestRating",
                  onlyWithImages: false,
                })
              }
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {showReviewForm && (
        <div className="review-form-modal">
          <div className="review-form-container">
            <ReviewForm
              productId={product.id}
              productName={product.name}
              onSubmit={handleReviewSubmit}
              onClose={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
