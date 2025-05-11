"use client"

import { useState } from "react"
import "./StarRating.css"

//showEmpty

function StarRating({ rating, editable = false, onChange = false, maxStars = 5 }) {
  const [hoverRating, setHoverRating] = useState(0)
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1)

  const handleMouseEnter = (value) => {
    if (editable) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0)
    }
  }

  const handleClick = (value) => {
    if (editable && onChange) {
      onChange(value)
    }
  }

  return (
    <div className={`star-rating ${editable ? "editable" : ""}`} onMouseLeave={handleMouseLeave}>
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${star <= (hoverRating || rating) ? "filled" : "empty"}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          role={editable ? "button" : "presentation"}
          tabIndex={editable ? 0 : undefined}
          aria-label={editable ? `Rate ${star} stars` : undefined}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default StarRating
