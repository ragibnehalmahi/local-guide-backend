📖 Overview
Local Guide Platform is a comprehensive backend system that connects travelers with local guides for authentic travel experiences. The platform enables guides to create and manage tour listings while allowing tourists to discover, book, and review these experiences.

✨ Key Features
🔐 JWT-based Authentication with role-based access control

👥 Multi-role System (Tourist, Guide, Admin)

🏷️ Tour Listing Management with images and categories

📅 Booking System with status tracking

⭐ Review & Rating System

🔍 Advanced Search & Filtering

💳 Payment Integration Ready

📱 RESTful API Design

🛠️ Tech Stack
Backend
Node.js - Runtime environment

Express.js - Web framework

TypeScript - Type safety

MongoDB - Database

Mongoose - ODM

JWT - Authentication

Bcrypt - Password hashing

Zod - Schema validation

Multer - File uploads

Development Tools
Nodemon - Development server

ESLint & Prettier - Code quality

Postman - API testing

Morgan - HTTP request logging

Cors - Cross-origin resource sharing

📁 Project Structure
text
backend/
├── src/
│   ├── app/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts      
│   │   │   ├── error.middleware.ts     
│   │   │   ├── validate.middleware.ts  
│   │   │   └── upload.middleware.ts    
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.route.ts
│   │   │   │   └── auth.validation.ts
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── user.route.ts
│   │   │   │   ├── user.validation.ts
│   │   │   │   └── user.interface.ts
│   │   │   │
│   │   │   ├── listing/
│   │   │   │   ├── listing.controller.ts
│   │   │   │   ├── listing.service.ts
│   │   │   │   ├── listing.route.ts
│   │   │   │   ├── listing.validation.ts
│   │   │   │   └── listing.interface.ts
│   │   │   │
│   │   │   ├── booking/
│   │   │   │   ├── booking.controller.ts
│   │   │   │   ├── booking.service.ts
│   │   │   │   ├── booking.route.ts
│   │   │   │   ├── booking.validation.ts
│   │   │   │   └── booking.interface.ts
│   │   │   │
│   │   │   ├── review/
│   │   │   │   ├── review.controller.ts
│   │   │   │   ├── review.service.ts
│   │   │   │   ├── review.route.ts
│   │   │   │   ├── review.validation.ts
│   │   │   │   └── review.interface.ts
│   │   │   │
│   │   │   └── payment/
│   │   │       ├── payment.controller.ts
│   │   │       ├── payment.service.ts
│   │   │       ├── payment.route.ts
│   │   │       └── payment.interface.ts
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts      
│   │   │   ├── cloudinary.ts     
│   │   │   └── constants.ts      
│   │   │
│   │   ├── utils/
│   │   │   ├──  ...
│   │   │
│   │   ├── models/
│   │   │   ├── User.model.ts
│   │   │   ├── Listing.model.ts
│   │   │   ├── Booking.model.ts
│   │   │   ├── Review.model.ts
│   │   │   └── Payment.model.ts
│   │   │
│   │   └── app.ts               
│   │   └── server.ts            
│   │
│   ├── types/
│   │   └── express/
│   │       └── index.d.ts       
│   │
│   └── tests/
│       ├──  ...
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── eslint.config.js
└── README.md
🌐 API Documentation
Base URL
text
http://localhost:5000/api/v1
📊 API Endpoints Summary
🔐 Authentication
Method	Endpoint	Description	Auth Required
POST	/auth/register	Register new user	
POST	/auth/login	Login user	
POST	/auth/refresh-token	Refresh access token	
POST	/auth/logout	Logout user	
POST	/auth/forgot-password	Request password reset	
POST	/auth/reset-password	Reset password	
👤 User Management
Method	Endpoint	Description	Auth Required	Role
GET	/users/profile	Get current user profile		All
PATCH	/users/profile	Update user profile		All
GET	/users/:id	Get public user profile		-
GET	/users	Get all users (Admin)		Admin
PATCH	/users/:id	Update any user (Admin)		Admin
DELETE	/users/:id	Delete user (Admin)		Admin
🏷️ Listing Management
Method	Endpoint	Description	Auth Required	Role
GET	/listings	Get all listings		-
GET	/listings/:id	Get listing details		-
POST	/listings	Create new listing		Guide
PATCH	/listings/:id	Update listing		Guide/Admin
DELETE	/listings/:id	Delete listing		Guide/Admin
GET	/listings/guide/my-listings	Get guide's listings		Guide
GET	/listings/search	Search listings		-
📅 Booking System
Method	Endpoint	Description	Auth Required	Role
POST	/bookings	Create booking request		Tourist
GET	/bookings/:id	Get booking details		Tourist/Guide
PATCH	/bookings/:id/status	Update booking status		Guide
GET	/bookings/user/my-bookings	Get user bookings		Tourist
GET	/bookings/guide/my-bookings	Get guide bookings		Guide
DELETE	/bookings/:id	Cancel booking		Tourist
⭐ Reviews & Ratings
Method	Endpoint	Description	Auth Required	Role
POST	/reviews	Create review		Tourist
GET	/reviews/listing/:id	Get listing reviews		-
GET	/reviews/guide/:id	Get guide reviews		-
PATCH	/reviews/:id	Update review		Tourist
DELETE	/reviews/:id	Delete review		Tourist/Admin
🔧 Environment Variables
Create a .env file in the root directory:

env
# Server Configuration
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/local-guide
DB_NAME=local-guide

# JWT
JWT_ACCESS_SECRET=your-access-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_SECRET=your-cookie-secret
COOKIE_EXPIRES_IN=7

# Cloudinary (For Image Uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Email Service (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@localguide.com
FROM_NAME=Local Guide Platform
🚀 Installation & Setup
Prerequisites
Node.js (v18 or higher)

MongoDB (v6 or higher)

npm or yarn

Step-by-Step Installation
Clone the repository

bash
git clone <repository-url>
cd local-guide-backend
Install dependencies

bash
npm install
# or
yarn install
Setup environment variables

bash
cp .env.example .env
# Edit .env file with your configuration
Start MongoDB

bash
# For macOS
brew services start mongodb-community

# For Windows (Run as Administrator)
net start MongoDB

# For Linux
sudo systemctl start mongod
Run the application

Development mode:

bash
npm run dev
# or
yarn dev
Production mode:

bash
npm run build
npm start
