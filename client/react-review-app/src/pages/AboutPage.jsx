import "./AboutPage.css"

function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="content-container">
          <h1>About Us</h1>
          <p>Crafting delicious cookies with love since 2010</p>
        </div>
      </div>

      <div className="content-container">
        <section className="about-section">
          <div className="about-grid">
            <div className="about-content">
              <h2>Our Story</h2>
              <p>
                Cookies began with a simple passion for baking. Our founder, Jane Smith, started baking cookies in her
                home kitchen, sharing them with friends and family who couldn't get enough of her delicious creations.
              </p>
              <p>
                What started as a hobby quickly grew into a small business as word spread about these incredible
                cookies. In 2010, Jane opened her first small bakery, and Cookies was born.
              </p>
              <p>
                Today, we've grown into a beloved brand known for our commitment to quality, taste, and the joy that
                comes from a perfect cookie. While we've expanded, we still bake each cookie with the same care and
                attention to detail as Jane did in her home kitchen.
              </p>
            </div>
            <div className="about-image">
              <img src="http://localhost:5000/images/our-story.jpg" alt="Our Story" />
            </div>
          </div>
        </section>

        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>Quality Ingredients</h3>
              <p>
                We use only the finest, freshest ingredients in our cookies. From premium chocolate to locally sourced
                butter, quality is never compromised.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">❤️</div>
              <h3>Made with Love</h3>
              <p>
                Every cookie is crafted with care and attention to detail. We believe you can taste the difference when
                food is made with love.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Sustainability</h3>
              <p>
                We're committed to sustainable practices, from eco-friendly packaging to reducing waste in our
                production process.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Community</h3>
              <p>
                We believe in giving back to our community through charitable initiatives and supporting local causes.
              </p>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="team-image">
                <img src="http://localhost:5000/images/team-1.jpg" alt="Jane Smith" />
              </div>
              <h3>Jane Smith</h3>
              <p className="team-role">Founder & Head Baker</p>
              <p className="team-bio">
                Jane's passion for baking started in her grandmother's kitchen and led to the creation of Cookies. She
                still develops all our recipes.
              </p>
            </div>
            <div className="team-member">
              <div className="team-image">
                <img src="http://localhost:5000/images/team-2.jpg" alt="Michael Johnson" />
              </div>
              <h3>Michael Johnson</h3>
              <p className="team-role">Master Baker</p>
              <p className="team-bio">
                With 15 years of experience in pastry, Michael ensures every batch of cookies meets our high standards.
              </p>
            </div>
            <div className="team-member">
              <div className="team-image">
                <img src="http://localhost:5000/images/team-3.jpg" alt="Sarah Williams" />
              </div>
              <h3>Sarah Williams</h3>
              <p className="team-role">Customer Experience</p>
              <p className="team-bio">
                Sarah makes sure every customer has an amazing experience, from ordering to that first delicious bite.
              </p>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <h2>Visit Us</h2>
          <div className="contact-grid">
            <div className="contact-info">
              <h3>Store Hours</h3>
              <p>Monday - Friday: 7am - 7pm</p>
              <p>Saturday: 8am - 6pm</p>
              <p>Sunday: 9am - 5pm</p>

              <h3>Contact</h3>
              <p>Phone: (555) 123-4567</p>
              <p>Email: hello@cookiesshop.com</p>

              <h3>Location</h3>
              <p>123 Baker Street</p>
              <p>Cookieville, CA 90210</p>
            </div>
            <div className="contact-map">
              <img src="http://localhost:5000/images/map.jpg" alt="Store Location" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
