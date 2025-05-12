import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import ProductsPage from "./pages/ProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import AboutPage from "./pages/AboutPage"
import NotFoundPage from "./pages/NotFoundPage" // Create this component
import "./App.css"

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} /> {/* Add a catch-all route */}
          </Routes>
        </main>

        <footer className="footer">
          <div className="content-container">
            <div className="footer-content">
              <div className="footer-logo">
                <h2>Cookies</h2>
                <p>Delicious treats for every occasion</p>
              </div>

              <div className="footer-links">
                <h3>Quick Links</h3>
                <ul>
                  <li>
                    <a href="/">Home</a>
                  </li>
                  <li>
                    <a href="/products">Products</a>
                  </li>
                  <li>
                    <a href="/about">About Us</a>
                  </li>
                </ul>
              </div>

              <div className="footer-contact">
                <h3>Contact Me</h3>
                <p>Varna, Bulgaria</p>
                <p>Phone: +(359) 899-921-106</p>
                <p>Email: valentinducev77@gmail.com</p>
                <p>Github: valentinDuchev</p>

              </div>
            </div>

            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} Cookies. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
