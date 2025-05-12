"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import ProductDetail from "../components/ProductDetail"
import "./ProductDetailPage.css"

function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        console.log(`Fetching product with ID: ${productId}`) // Debug log

        // Use relative path with the proxy
        const response = await fetch(`https://cookies-review-server.vercel.app/api/products/${productId}`)

        if (!response.ok) {
          console.error(`Failed to fetch product: ${response.status} ${response.statusText}`)
          throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Product data received:", data) // Debug log
        setProduct(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching product:", error)
        setError(`Product not found: ${error.message}`)
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleBack = () => {
    navigate("/products")
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>
  if (!product) return <div className="error">Product not found</div>

  return (
    <div className="product-detail-page">
      <div className="content-container">
        <ProductDetail product={product} onBack={handleBack} />
      </div>
    </div>
  )
}

export default ProductDetailPage
