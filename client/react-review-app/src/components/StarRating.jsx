"use client"

import "./StarRating.css"

function StarRating({ rating, maxStars = 5, editable = false, onChange }) {
  const handleClick = (index) => {
    if (editable && onChange) {
      onChange(index + 1)
    }
  }

  return (
    <div className={`star-rating ${editable ? "editable" : ""}`}>
      {[...Array(maxStars)].map((_, i) => (
        <span
          key={i}
          className={`star ${i < Math.floor(rating) ? "filled" : ""} ${
            i === Math.floor(rating) && rating % 1 > 0 ? "half-filled" : ""
          }`}
          onClick={() => handleClick(i)}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default StarRating
