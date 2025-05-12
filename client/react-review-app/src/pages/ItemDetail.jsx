"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"

function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  console.log(id)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`https://cookies-review-server.vercel.app/api/items/${id}`)
        setItem(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch item details")
        setLoading(false)
        console.error(err)
      }
    }

    fetchItem()
  }, [id])

  const handleDelete = async () => {
    try {
      await axios.delete(`https://cookies-review-server.vercel.app/api/items/${id}`)
      navigate("/items")
    } catch (err) {
      setError("Failed to delete item")
      console.error(err)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!item) return <div>Item not found</div>

  return (
    <div className="item-detail">
      <h1>{item.name}</h1>
      <p>
        <strong>Description:</strong> {item.description}
      </p>
      <p>
        <strong>Price:</strong> ${item.price}
      </p>
      <p>
        <strong>Created:</strong> {new Date(item.createdAt).toLocaleDateString()}
      </p>

      <div className="actions">
        <button onClick={() => navigate("/items")}>Back to Items</button>
        <button onClick={handleDelete} className="delete">
          Delete Item
        </button>
      </div>
    </div>
  )
}

export default ItemDetail
