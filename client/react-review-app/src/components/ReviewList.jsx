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

      const response = await fetch(`https://cookies-review-server.vercel.app${endpoint}`, {
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

  // Generate page numbers for pagination
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null

    const currentPage = pagination.currentPage
    const totalPages = pagination.totalPages

    // Generate array of page numbers to display
    const pageNumbers = []

    // For small number of pages, show all
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // For larger number of pages, show smart range
      if (currentPage <= 4) {
        // Near the beginning
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        // In the middle
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      }
    }

    return (
      <div className="pagination">
        <div className="pagination-numbers">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="page-ellipsis">
                  ...
                </span>
              )
            }
            return (
              <button
                key={page}
                className={`page-number ${page === currentPage ? "active" : ""}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )
          })}

          {currentPage < totalPages && (
            <button className="next-page" onClick={() => onPageChange(currentPage + 1)} aria-label="Next page">
              →
            </button>
          )}
        </div>
      </div>
    )
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
                <img src={`${review.image}`} alt="Review" />
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V13C2 12.4696 2.21071 11.9609 2.58579 11.5858C2.96086 11.2107 3.46957 11 4 11H7M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3821 9.90629 21.1919 9.68751C21.0016 9.46873 20.7661 9.29393 20.5016 9.17522C20.2371 9.0565 19.9499 8.99672 19.66 9H14Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="count">{review.helpfulCount || 0}</span>
              </button>

              <button
                className="feedback-button"
                onClick={() => handleFeedbackClick(review.id, false)}
                aria-label="Mark as not helpful"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M17 2H20C20.5304 2 21.0391 2.21071 21.4142 2.58579C21.7893 2.96086 22 3.46957 22 4V11C22 11.5304 21.7893 12.0391 21.4142 12.4142C21.0391 12.7893 20.5304 13 20 13H17M10 15V19C10 19.7956 10.3161 20.5587 10.8787 21.1213C11.4413 21.6839 12.2044 22 13 22L17 13V2H5.72C5.23768 1.99448 4.76965 2.16359 4.40209 2.47599C4.03452 2.78839 3.79217 3.22309 3.72 3.7L2.34 12.7C2.29651 12.9866 2.31583 13.2793 2.39666 13.5577C2.4775 13.8362 2.61788 14.0937 2.80812 14.3125C2.99837 14.5313 3.23387 14.7061 3.49834 14.8248C3.76281 14.9435 4.05009 15.0033 4.34 15H10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="count">{review.notHelpfulCount || 0}</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {renderPagination()}

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
