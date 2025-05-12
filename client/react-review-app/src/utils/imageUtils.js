/**
 * Gets the correct image URL whether it's a Vercel Blob URL or a relative path
 * @param {string} path - The image path or URL
 * @returns {string|null} - The full image URL or null if no path provided
 */
export function getImageUrl(path) {
  if (!path) return null

  // If it's already a full URL (from Vercel Blob), return it as is
  if (path.startsWith("http")) return path

  // For relative paths, use the API endpoint
  return `/api/images/${path.startsWith("/") ? path.substring(1) : path}`
}
