function NotFoundPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" style={{ display: "inline-block", marginTop: "1rem", color: "#8b4513" }}>
        Return to Home
      </a>
    </div>
  )
}

export default NotFoundPage
