"use client"

import StarRating from "./StarRating"
import "./ProductList.css"

function ProductList({ products, onSelectProduct }) {
  return (
    <div className="product-list">
      <h2>Our Products</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card" onClick={() => onSelectProduct(product.id)}>
            <div className="product-image">
              <img src={product.image || "/placeholder.svg"} alt={product.name} />
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
    </div>
  )
}

export default ProductList
