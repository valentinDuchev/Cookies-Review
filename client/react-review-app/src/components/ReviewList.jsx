"use client"

import { useState } from "react"
import StarRating from "./StarRating"
import EmailModal from "./EmailModal"
import "./ReviewList.css"

function ReviewList({ reviews, pagination, onPageChange, onHelpfulClick, onNotHelpfulClick }) {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [modalAction, setModalAction] = useState(null)
  const [modalReviewId, setModalReviewId] = useState(null)
  const [modalMessage, setModalMessage] = useState("")
  const [modalTitle, setModalTitle] = useState("")
  const [feedbackMessage, setFeedbackMessage] = useState(null)

  if (!reviews || reviews.length === 0) {
    return <div className="no-reviews">No reviews yet. Be the first to review!</div>
  }

  const formatDate = (dateString) => {
    const options = { month: "2-digit", day: "2-digit", year: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const handleFeedbackClick = (reviewId, isHelpful) => {
    setModalReviewId(reviewId)
    setModalAction(isHelpful ? "helpful" : "notHelpful")
    setModalTitle(isHelpful ? "Mark as Helpful" : "Mark as Not Helpful")
    setModalMessage("Please enter your email to submit your feedback.")
    setShowEmailModal(true)
  }

  const handleEmailSubmit = async (email) => {
    try {
      const endpoint =
        modalAction === "helpful"
          ? `/api/reviews/${modalReviewId}/helpful`
          : `/api/reviews/${modalReviewId}/not-helpful`

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.alreadyInteracted) {
          setFeedbackMessage({
            type: "info",
            text: data.message,
            reviewId: modalReviewId,
          })
        } else {
          throw new Error(data.message || "Failed to submit feedback")
        }
      } else {
        // Update the review counts
        if (modalAction === "helpful") {
          onHelpfulClick(modalReviewId, data.helpfulCount, data.notHelpfulCount)
        } else {
          onNotHelpfulClick(modalReviewId, data.helpfulCount, data.notHelpfulCount)
        }

        setFeedbackMessage({
          type: "success",
          text: data.message || "Thank you for your feedback!",
          reviewId: modalReviewId,
        })
      }

      // Close the modal
      setShowEmailModal(false)

      // Clear feedback message after 3 seconds
      setTimeout(() => {
        setFeedbackMessage(null)
      }, 3000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setFeedbackMessage({
        type: "error",
        text: error.message || "An error occurred. Please try again.",
        reviewId: modalReviewId,
      })
    }
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-left">
            <div className="review-rating">
              <StarRating rating={review.rating} />
            </div>
            <div className="review-author">{review.name}</div>
            <div className="review-date">{formatDate(review.date)}</div>
          </div>

          <div className="review-right">
            <h3 className="review-title">{review.title}</h3>
            <p className="review-content">{review.review}</p>

            {review.image && (
              <div className="review-image">
                <img src={`http://localhost:5000${review.image}`} alt="Review" />
              </div>
            )}

            <div className="review-feedback">
              {feedbackMessage && feedbackMessage.reviewId === review.id && (
                <div className={`feedback-message ${feedbackMessage.type}`}>{feedbackMessage.text}</div>
              )}

              <span className="feedback-question">Was this helpful?</span>
              <button
                className="feedback-button"
                onClick={() => handleFeedbackClick(review.id, true)}
                aria-label="Mark as helpful"
              >
                <span className="thumbs-icon">👍</span>
                <span className="count">{review.helpfulCount || 0}</span>
              </button>

              <button
                className="feedback-button"
                onClick={() => handleFeedbackClick(review.id, false)}
                aria-label="Mark as not helpful"
              >
                <span className="thumbs-icon">👎</span>
                <span className="count">{review.notHelpfulCount || 0}</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => onPageChange(pagination.currentPage - 1)}
            className="pagination-button"
          >
            Previous
          </button>

          <span className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => onPageChange(pagination.currentPage + 1)}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}

      {showEmailModal && (
        <EmailModal
          title={modalTitle}
          message={modalMessage}
          onSubmit={handleEmailSubmit}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  )
}

export default ReviewList
