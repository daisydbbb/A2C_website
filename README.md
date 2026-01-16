# Addicted2Cardboard Website

A full-stack eCommerce website for selling One Piece trading cards, built with React + TypeScript + Tailwind CSS (frontend) and Node.js + Express + MongoDB (backend).

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Authentication**: JWT with httpOnly cookies
- **Roles**: Customer (public signup) and Owner (admin login only)

## Project Structure

```
A2C_website/
├── frontend/          # React frontend application
├── backend/           # Express backend API
└── package.json       # Root package.json for workspace
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Install dependencies for all workspaces:
```bash
npm run install:all
```

Or install manually:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

1. Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/addicted2cardboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

2. Make sure MongoDB is running locally or update `MONGODB_URI` to your MongoDB Atlas connection string.

### Running the Application

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

The backend server will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

The frontend will run on `http://localhost:5173`

## Features

### Authentication

- **Customer Signup**: Public signup available at `/signup`
- **Login**: Both customers and owners can login at `/login`
- **Owner Accounts**: Cannot be created publicly. Must be created directly in the database or through a seed script.

### User Roles

- **Customer**: Can browse products, add to cart, checkout, view orders, and send messages
- **Owner**: Admin access to manage products, inventory, orders, refunds, and customer messages

### Protected Routes

- Routes can be protected using the `ProtectedRoute` component
- Role-based access control is enforced on the backend using middleware

## Creating an Owner Account

Since owner accounts cannot be created through the public signup, you'll need to create one directly in MongoDB or via a script. Example:

```javascript
// In MongoDB shell or using mongoose
db.users.insertOne({
  email: "owner@example.com",
  password: "$2a$10$...", // bcrypt hash of password
  role: "owner",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or create a seed script in the backend to create an owner account.

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Customer signup
- `POST /api/auth/login` - Login (customer or owner)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/admin/check` - Check owner access (owner only)

## Development

- Backend uses `tsx` for TypeScript execution in development
- Frontend uses Vite for fast development server
- Both use TypeScript with strict mode enabled

## Next Steps

- Product catalog implementation
- Shopping cart functionality
- Checkout and payment integration (Stripe)
- Order management
- Messaging system
- AWS S3 integration for image storage
