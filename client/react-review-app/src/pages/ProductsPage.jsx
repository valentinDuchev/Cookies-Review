"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import StarRating from "../components/StarRating"
import "./ProductsPage.css"

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        console.log("Fetching products list") // Debug log

        // Use relative path with the proxy
        const response = await fetch(`/api/products`)

        if (!response.ok) {
          console.error(`Failed to fetch products: ${response.status} ${response.statusText}`)
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()
        console.log(`Received ${data.length} products`) // Debug log
        setProducts(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Get the base URL for images
  const getImageUrl = (path) => {
    // If path is already a full URL, return it as is
    if (path && path.startsWith("http")) return path

    // Otherwise, use the current origin
    return path ? `${window.location.origin}${path}` : null
  }

  const handleFilterChange = (option) => {
    setFilter(option)
    setShowFilterOptions(false)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleProductClick = (productId) => {
    console.log(`Navigating to product: ${productId}`) // Debug log
    navigate(`/products/${productId}`)
  }

  const getFilteredAndSortedProducts = () => {
    // First filter products
    let filteredProducts = [...products]
    if (filter === "highRated") {
      filteredProducts = filteredProducts.filter((product) => product.rating >= 4.5)
    } else if (filter === "popular") {
      filteredProducts = filteredProducts.filter((product) => product.reviewCount >= 25)
    }

    // Then sort products
    if (sortBy === "price-low") {
      filteredProducts.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      filteredProducts.sort((a, b) => b.price - a.price)
    } else if (sortBy === "rating") {
      filteredProducts.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "reviews") {
      filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount)
    }

    return filteredProducts
  }

  const getFilterLabel = () => {
    switch (filter) {
      case "all":
        return "All Products"
      case "highRated":
        return "Highly Rated (4.5+)"
      case "popular":
        return "Popular (25+ reviews)"
      default:
        return "All Products"
    }
  }

  const _getSortLabel = () => {
    switch (sortBy) {
      case "rating":
        return "Highest Rating"
      case "reviews":
        return "Most Reviews"
      case "price-low":
        return "Price: Low to High"
      case "price-high":
        return "Price: High to Low"
      default:
        return "Highest Rating"
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>

  const filteredAndSortedProducts = getFilteredAndSortedProducts()

  return (
    <div className="products-page">
      <div className="content-container">
        <h1>All Products</h1>

        <div className="filters-container">
          <div className="filter-dropdown">
            <label>Filter:</label>
            <div className="dropdown">
              <button className="dropdown-button" onClick={() => setShowFilterOptions(!showFilterOptions)}>
                {getFilterLabel()}
              </button>
              {showFilterOptions && (
                <div className="dropdown-content">
                  <div
                    className={`dropdown-item ${filter === "all" ? "active" : ""}`}
                    onClick={() => handleFilterChange("all")}
                  >
                    All Products
                  </div>
                  <div
                    className={`dropdown-item ${filter === "highRated" ? "active" : ""}`}
                    onClick={() => handleFilterChange("highRated")}
                  >
                    Highly Rated (4.5+)
                  </div>
                  <div
                    className={`dropdown-item ${filter === "popular" ? "active" : ""}`}
                    onClick={() => handleFilterChange("popular")}
                  >
                    Popular (25+ reviews)
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sort-dropdown">
            <label>Sort By:</label>
            <div className="dropdown">
              <select className="dropdown-select" value={sortBy} onChange={handleSortChange}>
                <option value="rating">Highest Rating</option>
                <option value="reviews">Most Reviews</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="products-grid">
          {filteredAndSortedProducts.map((product) => (
            <div key={product.id} className="product-card" onClick={() => handleProductClick(product.id)}>
              <div className="product-image">
                <img src={getImageUrl(product.image) || "/placeholder.svg"} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <div className="product-rating">
                  <StarRating rating={product.rating} />
                  <span className="review-count">({product.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedProducts.length === 0 && (
          <div className="no-products">
            <p>No products match your current filters.</p>
            <button
              onClick={() => {
                setFilter("all")
                setSortBy("rating")
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage
