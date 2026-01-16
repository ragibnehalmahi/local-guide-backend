# 🗺️ Local Guide Platform - Backend API

 ## 🎯 Overview

**Local Guide Platform** is a comprehensive backend API that connects travelers with local guides for authentic travel experiences. The platform enables guides to create and manage tour listings while allowing tourists to discover, book, and review these experiences.

### 🌟 Why Choose Local Guide?

- **For Travelers**: Discover authentic local experiences beyond typical tourist spots
- **For Guides**: Monetize local knowledge and expertise
- **For Communities**: Promote cultural exchange and sustainable tourism
- **Trust & Safety**: Verified profiles, secure payments, and review system

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Tourist, Guide, Admin)
- Secure password hashing with bcrypt
- Email verification system
- Social login integration ready

### 👥 User Management
- Multi-role user system
- Profile management with images
- Guide-specific fields (expertise, rates, availability)
- Tourist-specific preferences
- Admin dashboard for user management

### 🏷️ Tour Listings
- Create, read, update, delete tour listings
- Multiple categories (Food, Nature, History, Art, Adventure)
- Image upload support (Cloudinary)
- Pricing and duration management
- Location-based listings

### 📅 Booking System
- Real-time booking requests
- Booking status tracking (Pending, Confirmed, Completed, Cancelled)
- Calendar-based availability
- Group size management
- Automated notifications

### ⭐ Reviews & Ratings
- Post-tour reviews and ratings
- Guide rating system (1-5 stars)
- Verified reviews only
- Review moderation
- Average rating calculations

### 🔍 Advanced Search
- Filter by location, price, category, date
- Language-based filtering
- Guide expertise matching
- Popularity and rating sorting
- Pagination and sorting

### 💳 Payment Integration
- Stripe payment gateway ready
- Secure payment processing
- Booking confirmation emails
- Refund management
- Transaction history

## 🛠️ Tech Stack

**Backend:**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

**Authentication & Security:**
- **JWT** - JSON Web Tokens
- **Bcrypt** - Password hashing
- **Cors** - Cross-origin resource sharing
- **Helmet** - Security headers

**Validation & Utilities:**
- **Zod** - Schema validation
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Cloudinary** - Image storage
- **Morgan** - HTTP request logger

**Development Tools:**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **Postman** - API testing

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/local-guide-backend.git
cd local-guide-backend
Install dependencies

bash
npm install
# or
yarn install
Configure environment variables

bash
cp .env.example .env
# Edit .env file with your configuration
Start MongoDB

bash
# For Windows
net start MongoDB

# For macOS
brew services start mongodb-community

# For Linux
sudo systemctl start mongod
Run the application

bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
Access the API

text
Server running on: http://localhost:5000
API Documentation: http://localhost:5000/api/v1/docs
📚 API Documentation
Base URL
text
http://localhost:5000/api/v1
Authentication Endpoints
Method	Endpoint	Description	Auth Required
POST	/auth/register	Register new user	
POST	/auth/login	Login user	
POST	/auth/refresh-token	Refresh access token	
POST	/auth/logout	Logout user	
POST	/auth/forgot-password	Request password reset	
POST	/auth/reset-password	Reset password	
User Management Endpoints
Method	Endpoint	Description	Role
GET	/users/profile	Get current profile	All
PATCH	/users/profile	Update profile	All
GET	/users/:id	Get public profile	-
GET	/users	Get all users	Admin
PATCH	/users/:id	Update user	Admin
DELETE	/users/:id	Delete user	Admin
Listing Management Endpoints
Method	Endpoint	Description	Role
GET	/listings	Get all listings	-
GET	/listings/:id	Get listing details	-
POST	/listings	Create listing	Guide
PATCH	/listings/:id	Update listing	Guide/Admin
DELETE	/listings/:id	Delete listing	Guide/Admin
GET	/listings/search	Search listings	-
GET	/listings/guide/my-listings	 Guide's listings	Guide
Booking Endpoints
Method	Endpoint	Description	Role
POST	/bookings	Create booking	Tourist
GET	/bookings/:id	Get booking	Tourist/Guide
PATCH	/bookings/:id/status	Update status	Guide
GET	/bookings/user/my-bookings	User bookings	Tourist
GET	/bookings/guide/my-bookings	Guide bookings	Guide
DELETE	/bookings/:id	Cancel booking	Tourist
Review Endpoints
Method	Endpoint	Description	Role
POST	/reviews	Create review	Tourist
GET	/reviews/listing/:id	Listing reviews	-
GET	/reviews/guide/:id	Guide reviews	-
PATCH	/reviews/:id	Update review	Tourist
DELETE	/reviews/:id	Delete review	Tourist/Admin
📁 Project Structure
text
local-guide-backend/
├── src/
│   ├── app/
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Express middleware
│   │   ├── modules/         # Feature modules
│   │   ├── utils/          # Utility functions
│   │   ├── models/         # Database models
│   │   ├── routes/         # Route aggregator
│   │   ├── app.ts         # Express app config
│   │   └── server.ts      # Server entry point
│   ├── types/             # TypeScript types
│   └── tests/            # Test files
├── .env.example          # Environment template
├── .env                  # Environment variables
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── README.md           # This file
Module Structure
Each module follows this pattern:

text
modules/auth/
├── auth.controller.ts    # Request handling
├── auth.service.ts      # Business logic
├── auth.route.ts        # Route definitions
├── auth.validation.ts   # Zod schemas
├── auth.interface.ts    # TypeScript interfaces
└── index.ts            # Module exports
⚙️ Environment Variables
Create a .env file with the following variables:

env
# Server Configuration
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/local-guide
DB_NAME=local-guide

# JWT Authentication
JWT_ACCESS_SECRET=your-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_SECRET=your-cookie-secret
COOKIE_EXPIRES_IN=7

 

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

 
