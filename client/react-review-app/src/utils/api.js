import { BACKEND_URL } from "../App"

/**
 * Utility function for making API requests
 * @param {string} endpoint - The API endpoint to call
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The response data
 */
export async function fetchApi(endpoint, options = {}) {
  const url = `${BACKEND_URL}${endpoint}`

  try {
    const response = await fetch(url, options)

    // Check if the response is OK
    if (!response.ok) {
      // Try to parse error as JSON first
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json()
        throw new Error(errorData.message || `API error: ${response.status}`)
      } else {
        // If not JSON, throw a generic error with status
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
    }

    // Check if response is empty
    const text = await response.text()
    if (!text) {
      return null
    }

    // Try to parse as JSON
    try {
      return JSON.parse(text)
    } catch (e) {
        console.log(e)
      console.error("Failed to parse response as JSON:", text.substring(0, 100) + "...")
      throw new Error("Invalid JSON response from server")
    }
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Example usage:
// export const getProducts = () => fetchApi('/api/products')
// export const getProduct = (id) => fetchApi(`/api/products/${id}`)
