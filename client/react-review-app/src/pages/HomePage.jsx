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
        const response = await fetch("/api/products")
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

      <section className="about-preview">
        <div className="content-container">
          <div className="about-grid">
            <div className="about-image">
              <img src={getImageUrl("/images/bakery.jpg") || "/placeholder.svg"} alt="Our Bakery" />
            </div>
            <div className="about-content">
              <h2>Our Story</h2>
              <p>
                At Cookies, we believe in creating moments of joy through our delicious treats. Our journey began with a
                simple passion for baking and has evolved into a commitment to crafting the perfect cookie experience.
              </p>
              <p>
                Every cookie is made with care using only the finest ingredients, ensuring that each bite is as
                delightful as the last.
              </p>
              <Link to="/about" className="learn-more-button">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="content-container">
          <h2>What Our Customers Say</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <StarRating rating={5} />
              </div>
              <p className="testimonial-text">
                "These cookies are absolutely amazing! The peanut butter chocolate chip is my favorite."
              </p>
              <p className="testimonial-author">- Sarah J.</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <StarRating rating={5} />
              </div>
              <p className="testimonial-text">
                "I ordered these for a party and everyone loved them. Will definitely order again!"
              </p>
              <p className="testimonial-author">- Michael T.</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <StarRating rating={4} />
              </div>
              <p className="testimonial-text">
                "Great texture and flavor. The white chocolate macadamia is to die for."
              </p>
              <p className="testimonial-author">- Emily R.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
