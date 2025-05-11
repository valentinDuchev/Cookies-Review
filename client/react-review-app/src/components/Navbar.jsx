"use client"

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import "./Navbar.css"

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".navbar-container")) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/" onClick={closeMenu}>
            Cookies
          </NavLink>
        </div>

        <div className="navbar-menu-toggle" onClick={toggleMenu}>
          <div className={`hamburger ${isMenuOpen ? "active" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
            All Products
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
            About Us
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
