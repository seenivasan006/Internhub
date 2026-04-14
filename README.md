# InternHub - Student Platform

A comprehensive platform for students to find internships, manage applications, and get AI-assisted help with resumes and essays.

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: A running instance (local or Atlas)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in the following:
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A random string for token security.
- `GOOGLE_CLIENT_ID` / `SECRET`: Obtain these from Google Cloud Console (for auth).
- `SMTP_*`: Credentials for sending emails (can use Ethereal for testing).
- `ADZUNA_APP_ID` / `KEY`: For fetching internship listings.
- `AI_API_KEY`: For AI-assisted features.

### 3. Seed the Database (Optional)
To populate the database with initial internship data and test users:
```bash
npm run seed
```

### 4. Launch the Application
Run both the frontend and backend concurrently:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Deployment Guide

To deploy InternHub to a production environment:

### 1. Build the Project
This will generate the production-ready assets for both the frontend and backend.
```bash
npm run build
```
The compiled server will be in `dist/server.js`, and the frontend assets in the frontend build folder (standard Vite output).

### 2. Deployment Strategies

#### Option A: Unified Deployment (Vercel/Render/Railway)
1. **Provision a MongoDB Database**: Use MongoDB Atlas for a cloud-hosted database.
2. **Environment Variables**: Add all variables from your `.env` to your hosting provider's "Environment Variables" section.
3. **Start Command**: Set the start command to `npm start`.

#### Option B: Split Frontend & Backend
- **Frontend**: Deploy the static files from the build to Vercel, Netlify, or AWS S3/CloudFront.
- **Backend**: Deploy the Node.js server to a platform like Heroku, Render, Railway, or a VPS.
- **CORS**: Ensure `FRONTEND_URL` in the backend `.env` matches your production frontend URL.

---

## 🛠️ Key Scripts
- `npm run dev`: Start dev servers.
- `npm run build`: Build for production.
- `npm run start`: Run production server.
- `npm run seed`: Seed database.
