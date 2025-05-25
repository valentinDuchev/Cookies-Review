"use client"

import { useState } from "react"
import "./ReviewFilters.css"

function ReviewFilters({ onFilterChange, starCounts, currentFilters }) {
  const [filterRating, setFilterRating] = useState(currentFilters.filterRating)
  const [sortBy, setSortBy] = useState(currentFilters.sortBy)
  const [onlyWithImages, setOnlyWithImages] = useState(currentFilters.onlyWithImages)
  const [showFilterOptions, setShowFilterOptions] = useState(false)

  const handleFilterChange = (option) => {
    setFilterRating(option === filterRating ? null : option)
    setShowFilterOptions(false)
    onFilterChange({
      filterRating: option === filterRating ? null : option,
      sortBy,
      onlyWithImages,
    })
  }

  const handleSortChange = (option) => {
    setSortBy(option)
    onFilterChange({
      filterRating,
      sortBy: option,
      onlyWithImages,
    })
  }

  const handleImageFilterChange = () => {
    const newValue = !onlyWithImages
    setOnlyWithImages(newValue)
    onFilterChange({
      filterRating,
      sortBy,
      onlyWithImages: newValue,
    })
  }

  const getFilterLabel = () => {
    if (filterRating === 5) return "5 Stars"
    if (filterRating === 4) return "4 Stars"
    if (filterRating === 3) return "3 Stars"
    if (filterRating === 2) return "2 Stars"
    if (filterRating === 1) return "1 Star"
    if (onlyWithImages) return "With Images"
    return "All Reviews"
  }

  return (
    <div className="review-filters-container">
      <div className="filter-dropdown">
        <label>Filter:</label>
        <div className="dropdown">
          <button className="dropdown-button" onClick={() => setShowFilterOptions(!showFilterOptions)}>
            {getFilterLabel()}
          </button>
          {showFilterOptions && (
            <div className="dropdown-content">
              <div
                className={`dropdown-item ${!filterRating && !onlyWithImages ? "active" : ""}`}
                onClick={() => {
                  setFilterRating(null)
                  setOnlyWithImages(false)
                  setShowFilterOptions(false)
                  onFilterChange({
                    filterRating: null,
                    sortBy,
                    onlyWithImages: false,
                  })
                }}
              >
                All Reviews
              </div>
              <div
                className={`dropdown-item ${filterRating === 5 ? "active" : ""}`}
                onClick={() => handleFilterChange(5)}
              >
                5 Stars ({starCounts[5] || 0})
              </div>
              <div
                className={`dropdown-item ${filterRating === 4 ? "active" : ""}`}
                onClick={() => handleFilterChange(4)}
              >
                4 Stars ({starCounts[4] || 0})
              </div>
              <div
                className={`dropdown-item ${filterRating === 3 ? "active" : ""}`}
                onClick={() => handleFilterChange(3)}
              >
                3 Stars ({starCounts[3] || 0})
              </div>
              <div
                className={`dropdown-item ${filterRating === 2 ? "active" : ""}`}
                onClick={() => handleFilterChange(2)}
              >
                2 Stars ({starCounts[2] || 0})
              </div>
              <div
                className={`dropdown-item ${filterRating === 1 ? "active" : ""}`}
                onClick={() => handleFilterChange(1)}
              >
                1 Star ({starCounts[1] || 0})
              </div>
              <div
                className={`dropdown-item ${onlyWithImages ? "active" : ""}`}
                onClick={() => {
                  setFilterRating(null)
                  handleImageFilterChange()
                  setShowFilterOptions(false)
                }}
              >
                With Images
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sort-dropdown">
        <label>Sort by:</label>
        <div className="dropdown">
          <select className="dropdown-select" value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="highestRating">Highest Rating</option>
            <option value="lowestRating">Lowest Rating</option>
            <option value="mostHelpful">Most Helpful</option>
            <option value="date">Most Recent</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default ReviewFilters
