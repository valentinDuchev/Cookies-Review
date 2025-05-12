"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

function ItemList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`https://cookies-review-server.vercel.app/api/items`)
        setItems(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch items")
        setLoading(false)
        console.error(err)
      }
    }

    fetchItems()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="item-list">
      <h1>Items</h1>
      <div className="items">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <p>${item.price}</p>
            <Link to={`/items/${item.id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ItemList
