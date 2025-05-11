# Cookie Shop Review System

A full-stack e-commerce review system with a React frontend and Node.js backend. This application allows users to browse products, view and filter reviews, and submit their own reviews with images.

![Cookie Shop Screenshot](src\assets\image.png)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/cookie-shop-review-system.git
cd cookie-shop-review-system
\`\`\`

2. Install server dependencies:
\`\`\`bash
cd server
npm install
\`\`\`

3. Install client dependencies:
\`\`\`bash
cd ../client
npm install
\`\`\`

4. Start the server:
\`\`\`bash
cd ../server
npm run dev
\`\`\`

5. Start the client:
\`\`\`bash
cd ../client
npm run dev
\`\`\`

6. Open your browser and navigate to `http://localhost:5173`


## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Data Flow](#data-flow)
- [API Endpoints](#api-endpoints)
- [Database Structure](#database-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

This application is a product review system for a cookie shop. It allows customers to:
- Browse products
- View product details
- Read reviews from other customers
- Filter and sort reviews
- Submit their own reviews with ratings and images
- Mark reviews as helpful or not helpful

The system integrates with Shopify to fetch product data and stores reviews in a local database.

### Product Browsing
- Product listing with images, prices, and ratings
- Product detail pages with comprehensive information
- Average rating display

### Review System
- Star rating system (1-5 stars)
- Review submission with title, comment, and optional image upload
- Review filtering by rating and images
- Review sorting by highest/lowest rating, most helpful, and date
- Review pagination
- Helpful/not helpful voting system with email verification

### User Interface
- Responsive design for mobile and desktop
- Clean, intuitive navigation
- Image upload and preview
- Rating visualization with star icons and percentage bars

## Architecture

The application follows a client-server architecture:

\`\`\`
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Frontend │<────>│  Node.js Server │<────>│ Shopify API     │
│  (Vite)         │      │  (Express)      │      │                 │
│                 │      │                 │      │                 │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  │
                         ┌────────▼────────┐
                         │                 │
                         │  Local JSON DB  │
                         │  (db.json)      │
                         │                 │
                         └─────────────────┘
\`\`\`

- **Frontend**: React application built with Vite
- **Backend**: Node.js with Express
- **External API**: Shopify for product data
- **Database**: Local JSON file (db.json) for development, can be replaced with a real database in production

### Frontend
- React 18
- React Router 6
- Axios for API requests
- CSS for styling
- Vite for build and development

### Backend
- Node.js
- Express
- Multer for file uploads
- Shopify API Node client
- CORS for cross-origin requests


### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Shopify store with Admin API access

### Environment Variables
Create a `.env` file in the server directory with the following variables:
\`\`\`
SHOP_NAME=your-shop-name.myshopify.com
ADMIN_API_ACCESS_TOKEN=your-shopify-admin-api-token
PORT=5000
\`\`\`


## Data Flow

### Product Data Flow
1. Products are fetched from Shopify using the Shopify API
2. The server syncs products on startup and periodically (every hour)
3. Products are stored in the local database (db.json)
4. The frontend requests products from the Node.js server
5. The server returns products with calculated ratings based on reviews

### Review Data Flow
1. User submits a review through the frontend form
2. The form data (including any image) is sent to the server
3. The server processes the review, saves any uploaded image
4. The review is stored in the local database
5. Product ratings are recalculated based on all reviews
6. The updated review list is sent back to the frontend

### Helpful/Not Helpful System
1. User clicks helpful/not helpful button
2. If not previously verified, user is prompted for email
3. Email is stored in localStorage for future interactions
4. Server records the user's email with their helpful/not helpful vote
5. Users can only vote once per review (can change their vote)

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product by ID

### Reviews
- `GET /api/products/:productId/reviews` - Get reviews for a specific product
  - Query parameters:
    - `page`: Page number for pagination
    - `limit`: Number of reviews per page
    - `sortBy`: Sort method (highestRating, lowestRating, mostHelpful, date)
    - `filterRating`: Filter by star rating (1-5)
    - `onlyWithImages`: Filter to only show reviews with images (true/false)
- `POST /api/products/:productId/reviews` - Add a new review
- `POST /api/reviews/:reviewId/helpful` - Mark a review as helpful
- `POST /api/reviews/:reviewId/not-helpful` - Mark a review as not helpful
- `GET /api/reviews/:reviewId/interaction` - Check if a user has interacted with a review

## Database Structure

The application uses a JSON file (`db.json`) as a database with the following structure:

\`\`\`json
{
  "products": [
    {
      "id": 123456789,
      "name": "Chocolate Chip Cookie",
      "price": 2.99,
      "description": "Delicious chocolate chip cookie...",
      "image": "/images/chocolate-cookie.png",
      "rating": 4.5,
      "reviewCount": 10,
      "shopifyData": { ... }
    }
  ],
  "reviews": [
    {
      "id": 1,
      "productId": 123456789,
      "name": "John Doe",
      "email": "john@example.com",
      "rating": 5,
      "title": "Amazing cookies!",
      "review": "These are the best cookies I've ever had...",
      "date": "2023-05-15T14:30:00Z",
      "image": "/images/reviews/review-1.jpg",
      "helpfulEmails": ["user1@example.com", "user2@example.com"],
      "notHelpfulEmails": []
    }
  ]
}
\`\`\`

In development mode, the database is kept in memory to prevent file write conflicts with nodemon restarts.

## Deployment

### Backend Deployment (Vercel)
1. Create a `vercel.json` file in the server directory:
\`\`\`json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
\`\`\`

2. Set up environment variables in the Vercel dashboard
3. Deploy using the Vercel CLI or GitHub integration

### Frontend Deployment (Vercel)
1. Update the `BACKEND_URL` in `App.jsx` to point to your deployed backend
2. Deploy using the Vercel CLI or GitHub integration

## Troubleshooting

### Common Issues

#### "Failed to fetch products" error
- Check that your Shopify API credentials are correct
- Verify that your Shopify store is accessible
- Check server logs for specific error messages

#### Images not displaying
- Ensure the uploads directory exists and has write permissions
- Check that image paths are correct in the database
- Verify that the server is correctly serving static files

#### CORS errors
- Check that the CORS middleware is properly configured
- Verify that the frontend is making requests to the correct backend URL

#### Review submission fails
- Check that all required fields are filled out
- Verify that the image upload size is not too large
- Check server logs for validation errors

### Debugging

- Server logs are output to the console
- For more detailed logging, add `console.log` statements to relevant parts of the code
- Use browser developer tools to inspect network requests and responses

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Shopify API for product data
- All the open-source libraries used in this project
