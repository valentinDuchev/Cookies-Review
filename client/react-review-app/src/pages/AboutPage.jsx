import "./AboutPage.css"

function AboutPage() {
    return (
        <div className="about-page">
            <div className="about-hero">
                <div className="content-container">
                    <h1>About my App</h1>
                </div>
            </div>

            <div className="content-container">
                <section className="about-section">
                    <div className="about-grid">
                        <div className="about-content">
                            <h2>How it works</h2>
                            <p>
                                The app is built using ReactJS as a Front-End and NodeJS + Express as a Back-End API.

                            </p>
                            <p>
                                The database is a mix between my Shopify Store and a JSON file mockup in NodeJS.
                                Shopify provides me with the latest products I have on my store, and the JSON file in my server loads those items and stores the reviews for them.
                            </p>
                            <p>
                                Each Time the app is loaded, the latest data for products is being fetched from Shopify using a custom app for the Shopify API
                            </p>
                        </div>
                        <div className="about-image">
                            <img src="https://pqnuqvt6lmapn7tc.public.blob.vercel-storage.com/React%2BNode-upXNHob9OgxuzvBEyj1ZZIpNOwmmAT.png" alt="Our Story" />
                        </div>
                    </div>
                </section>

                <section className="team-section">
                    <h2>About Me</h2>
                    <div className="team-grid">
                        <div className="team-member">
                            <div className="team-image">
                                <img src="https://pqnuqvt6lmapn7tc.public.blob.vercel-storage.com/React-L7Hcgjr3Xa4aV7ktVADJgQCv0NNrsz.jpg" alt="Jane Smith" />
                            </div>
                            <h3>ReactJS</h3>

                            <p className="team-role">Front-End</p>
                            <p className="team-bio">
                                Passionate Front-End Developer with strong background using ReactJS
                            </p>
                        </div>
                        <div className="team-member">
                            <div className="team-image">
                                <img src="https://pqnuqvt6lmapn7tc.public.blob.vercel-storage.com/Node-H5LVQ4wMUfOsvKA9qImE39zsj6CCA8.webp" alt="Michael Johnson" />
                            </div>
                            <h3>NodeJS</h3>
                            <p className="team-role">Back-End</p>
                            <p className="team-bio">
                                Completing the Full Stack with a NodeJS Back-End Server
                            </p>
                        </div>
                        <div className="team-member">
                            <div className="team-image">
                                <img src="https://pqnuqvt6lmapn7tc.public.blob.vercel-storage.com/DB-TzkiqsIkwxvGb8CmJSFXcO2C2p9s3X.jpg" alt="Sarah Williams" />
                            </div>
                            <h3>MongoDB+PostgreSQL</h3>
                            <p className="team-role">Database</p>
                            <p className="team-bio">
                                What's better than being experienced in Relational Databases? 
                                That's right, being experienced in both Relational and Nonrelational Databases!
                            </p>
                        </div>
                    </div>
                </section>


            </div>
        </div>
    )
}

export default AboutPage
