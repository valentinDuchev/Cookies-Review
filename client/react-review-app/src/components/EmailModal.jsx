"use client"

import { useState } from "react"
import "./EmailModal.css"

function EmailModal({ onSubmit, onClose, title, message }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic email validation
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      await onSubmit(email)
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="email-modal-overlay" onClick={onClose}>
      <div className="email-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <h3>{title || "Enter Your Email"}</h3>
        <p className="modal-message">{message || "Please enter your email to continue."}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmailModal
