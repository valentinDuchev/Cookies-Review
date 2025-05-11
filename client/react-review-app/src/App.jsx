import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import ProductsPage from "./pages/ProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import AboutPage from "./pages/AboutPage"
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
                <h3>Contact Us</h3>
                <p>123 Baker Street</p>
                <p>Cookieville, CA 90210</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: hello@cookiesshop.com</p>
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
