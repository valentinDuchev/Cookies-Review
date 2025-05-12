"use client"
import StarRating from "./StarRating"
import { getImageUrl } from "../utils/imageUtils"

const ReviewItem = ({ review, onMarkHelpful, onMarkNotHelpful, userEmail }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="reviewer-info">
          <h3 className="reviewer-name">{review.name}</h3>
          <div className="review-date">{formatDate(review.date)}</div>
        </div>
        <div className="review-rating">
          <StarRating rating={review.rating} />
        </div>
      </div>
      <div className="review-content">
        <h4 className="review-title">{review.title}</h4>
        <p className="review-text">{review.review}</p>
        {review.image && (
          <div className="review-image">
            <img src={getImageUrl(review.image) || "/placeholder.svg"} alt="Review" />
          </div>
        )}
      </div>
      <div className="review-footer">
        <div className="review-helpful">
          <span>Was this review helpful?</span>
          <button className="helpful-btn" onClick={() => onMarkHelpful(review.id, userEmail)}>
            Yes ({review.helpfulCount || 0})
          </button>
          <button className="helpful-btn" onClick={() => onMarkNotHelpful(review.id, userEmail)}>
            No ({review.notHelpfulCount || 0})
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReviewItem
