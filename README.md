# Local Guide Platform - Backend

A robust REST API for managing guides, tourists, and tour experiences. Built with Node.js and TypeScript, this backend provides secure, efficient data management and role-based access control.

## 🚀 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JWT](https://jwt.io/) with custom Middleware
- **Security**: [Helmet](https://helmetjs.github.io/), [CORS](https://expressjs.com/en/resources/middleware/cors.html), [Rate-limit](https://github.com/n67/express-rate-limit)
- **Image Handling**: [Multer](https://github.com/expressjs/multer) / [Cloudinary](https://cloudinary.com/)
- **Logging**: [Morgan](https://github.com/expressjs/morgan)

## ✨ Core Features

- **Auth System**: Secure JSON Web Token authentication with login, registration, and role validation.
- **Listing Management**: Complete CRUD operations for tour listings with image upload support.
- **Booking Engine**: Manage booking requests, status updates, and tourist/guide relationships.
- **User Management**: Support for Tourist, Guide, and Admin roles with specific permissions.
- **Dashboard API**: Dedicated endpoints for guide and tourist dashboard summaries.
- **Input Validation**: Robust request body validation using [Zod](https://zod.dev/).

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (Local or Atlas)
- Cloudinary Account (for image uploads)

### Installation
1. Clone the repository
2. Navigate to the backend directory: `cd local-guide-backend`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file and add your environment variables:
   ```env
   PORT=5000
   DATABASE_URL=mongodb://localhost:27017/local-guide
   JWT_ACCESS_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

- `/src/app/modules`: Feature-based modular structure (listings, bookings, users, reviews).
- `/src/app/middlewares`: Custom Express middlewares (authGuard, error handlers).
- `/src/app/utils`: Helper functions and shared utilities.
- `/src/app/config`: System configurations (DB, Cloudinary).
- `/src/server.ts`: Entry point for the server.

---
Built with ❤️ by the Local Guide Platform Team.
