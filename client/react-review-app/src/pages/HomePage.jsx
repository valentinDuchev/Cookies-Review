"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import StarRating from "../components/StarRating"
import "./HomePage.css"

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use relative path with the proxy
        const response = await fetch(`/api/products`)
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await response.json()
        // Get 3 products with highest ratings
        const sorted = [...data].sort((a, b) => b.rating - a.rating).slice(0, 3)
        setFeaturedProducts(sorted)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>

  // Get the base URL for images
  const getImageUrl = (path) => {
    // If path is already a full URL, return it as is
    if (path && path.startsWith("http")) return path

    // Otherwise, use the current origin
    return path ? `${window.location.origin}${path}` : null
  }

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`)
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Delicious Cookies Baked with Love</h1>
          <p>Discover our handcrafted cookies made with premium ingredients</p>
          <Link to="/products" className="cta-button">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="featured-products">
        <div className="content-container">
          <h2>Featured Products</h2>
          <div className="featured-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="featured-card" onClick={() => handleProductClick(product.id)}>
                <div className="featured-image">
                  <img src={getImageUrl(product.image) || "/placeholder.svg"} alt={product.name} />
                </div>
                <div className="featured-info">
                  <h3>{product.name}</h3>
                  <p className="featured-price">${product.price.toFixed(2)}</p>
                  <div className="featured-rating">
                    <StarRating rating={product.rating} />
                    <span>({product.reviewCount} reviews)</span>
                  </div>
                  <button
                    className="view-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProductClick(product.id)
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      
    </div>
  )
}

export default HomePage
