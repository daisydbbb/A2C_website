# Environment Setup Guide

This guide will help you set up the `MONGODB_URI` and `JWT_SECRET` environment variables for the Addicted2Cardboard backend.

## Step 1: Create `.env` File

1. Copy the template file to create your actual `.env` file:

   ```bash
   cd backend
   cp env.template .env
   ```

2. Open the `.env` file in your editor and update the values as described below.

---

## Step 2: Set Up MongoDB URI

You have two options: **Local MongoDB** or **MongoDB Atlas** (cloud).

### Option A: Local MongoDB (Development)

If you have MongoDB installed locally:

1. **Install MongoDB** (if not already installed):

   - **macOS**: `brew install mongodb-community`
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **Linux**: Follow [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/installation/)

2. **Start MongoDB service**:

   - **macOS**: `brew services start mongodb-community`
   - **Windows**: MongoDB runs as a service (auto-starts)
   - **Linux**: `sudo systemctl start mongod`

3. **Set MONGODB_URI in `.env`**:

   ```env
   MONGODB_URI=mongodb://localhost:27017/addicted2cardboard
   ```

   - `localhost:27017` - Default MongoDB connection
   - `addicted2cardboard` - Database name (will be created automatically)

4. **Verify connection**:
   ```bash
   # Test MongoDB is running
   mongosh
   # Or use: mongo (older versions)
   ```

### Option B: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create a free MongoDB Atlas account**:

   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a new cluster**:

   - Click "Build a Database"
   - Choose the free tier (M0)
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Set up database access**:

   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure network access**:

   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (`0.0.0.0/0`)
   - For production: Add only your server's IP address
   - Click "Confirm"

5. **Get your connection string**:

   - Go to "Database" in the left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it looks like):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Set MONGODB_URI in `.env`**:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/addicted2cardboard?retryWrites=true&w=majority
   ```

   - Replace `<username>` and `<password>` with your database user credentials
   - Replace `cluster0.xxxxx` with your actual cluster name
   - The `/addicted2cardboard` part is the database name (will be created automatically)

   **Example**:

   ```env
   MONGODB_URI=mongodb+srv://admin:MyP@ssw0rd123@cluster0.abc123.mongodb.net/addicted2cardboard?retryWrites=true&w=majority
   ```

---

## Step 3: Generate JWT Secret

The JWT secret is used to sign and verify authentication tokens. **Never commit this to version control!**

### Option A: Using Node.js (Recommended)

1. **Open a Node.js REPL**:

   ```bash
   node
   ```

2. **Generate a random secret**:

   ```javascript
   require("crypto").randomBytes(64).toString("hex");
   ```

3. **Copy the generated string** and use it in your `.env` file:

   ```env
   JWT_SECRET=your-generated-secret-here-make-it-very-long-and-random
   ```

4. **Exit Node.js REPL**:
   ```javascript
   .exit
   ```

### Option B: Using OpenSSL

```bash
openssl rand -hex 64
```

Copy the output and use it as your `JWT_SECRET`.

### Option C: Online Generator

You can also use an online random string generator, but **only use this for development**, never for production.

**Important Notes**:

- The JWT secret should be **at least 32 characters long**
- Use a **different secret for development and production**
- **Never share** your JWT secret publicly or commit it to Git

---

## Step 4: Complete `.env` File Example

Here's what your complete `.env` file should look like:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/addicted2cardboard
# Or for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/addicted2cardboard?retryWrites=true&w=majority

JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Optional: For seeding owner account
# OWNER_EMAIL=owner@addicted2cardboard.com
# OWNER_PASSWORD=owner123456
```

---

## Step 5: Verify Your Setup

1. **Make sure your `.env` file is in the `backend` directory** (not committed to Git)

2. **Test MongoDB connection**:

   ```bash
   cd backend
   npm run dev
   ```

   You should see:

   ```
   ✅ Connected to MongoDB
   🚀 Server running on port 5000
   ```

3. **If you see connection errors**:
   - **Local MongoDB**: Make sure MongoDB service is running
   - **MongoDB Atlas**: Check your username/password and network access settings

---

## Security Best Practices

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Use different secrets for development and production**
3. **Rotate JWT secrets** periodically in production
4. **Use strong, unique passwords** for MongoDB Atlas
5. **Limit network access** in MongoDB Atlas to your application servers only

---

## Troubleshooting

### MongoDB Connection Issues

**Error: "ECONNREFUSED" or "Connection timeout"**

- Check if MongoDB is running: `brew services list` (macOS) or `systemctl status mongod` (Linux)
- Verify the MongoDB URI is correct
- For Atlas: Check network access allows your IP address

**Error: "Authentication failed"**

- Verify username and password in connection string
- Check database user permissions in MongoDB Atlas

### JWT Secret Issues

**Error: "JWT_SECRET is not defined"**

- Make sure `.env` file exists in `backend` directory
- Verify the file is named exactly `.env` (not `env` or `.env.txt`)
- Restart your server after creating/modifying `.env`

---

## Need Help?

- MongoDB Local Setup: [MongoDB Manual](https://www.mongodb.com/docs/manual/installation/)
- MongoDB Atlas: [Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- Node.js crypto: [Node.js crypto documentation](https://nodejs.org/api/crypto.html)
