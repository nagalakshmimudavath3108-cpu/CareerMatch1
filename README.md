# CareerMatch — Real-Time Talent & Opportunity Platform

A complete, production-grade full-stack recruitment platform connecting Job Seekers & Students with Recruiters & Companies featuring a transparent skill-matching algorithm, Socket.IO real-time notifications, direct candidate-recruiter messaging, interview scheduling, and platform administration.

---

## 🚀 Key Features

- **Transparent CareerMatch Algorithm**: Real skill-matching engine that computes percentage fit based on verified candidate skills vs. job requirements (Match % = Matched Skills / Total Required Skills × 100).
- **Real-Time Socket.IO Integration**: Live application submission alerts, real-time status progression, instant candidate-recruiter chat, and interview invitations.
- **Role-Based Workspaces**:
  - **Job Seeker**: Custom profile builder, job search & filter by skill/location/type, job application tracking, live status timeline, interview schedule, and direct messaging.
  - **Recruiter**: Company management, job posting & editing, auto-ranked candidate applicant pool, shortlisting & rejection workflow, interview calendar, and analytics.
  - **Admin**: System-wide dashboard statistics, user management, job listing moderation, application auditing, and platform skill analytics graphs.
- **Security & Uploads**: Password hashing via `bcryptjs`, JWT authentication middleware, file uploads for resumes and logos, protected routes, and environment variable configuration.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-Time**: Socket.IO Client
- **Icons & Charts**: Lucide React, Recharts

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ORM
- **Real-Time Engine**: Socket.IO Server
- **Auth**: JWT (JSON Web Tokens) & bcryptjs
- **File Uploads**: Multer & Cloudinary-ready architecture

---

## ⚙️ Installation & Setup Guide

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and a running **MongoDB** instance (local MongoDB server or MongoDB Atlas URI).

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup Environment File
# Create .env from template
cp .env.example .env
```

#### Environment Variables (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/careermatch
JWT_SECRET=careermatch_super_secret_jwt_key_2026_dev_prod
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Seed Demo Data

Run the seed script to populate realistic demo users, recruiters, jobs, applications, messages, and scheduled interviews:

```bash
npm run seed
```

#### Demo Login Accounts:
- **Admin**: `admin@careermatch.com` / `password123`
- **Recruiter**: `recruiter@techcorp.com` / `password123`
- **Job Seeker 1**: `alex@example.com` / `password123`
- **Job Seeker 2**: `elena@example.com` / `password123`

### 4. Start Backend Server

```bash
npm run dev
# Server will run on http://localhost:5000
```

---

### 5. Frontend Setup

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🧪 Testing & Verification

1. Open `http://localhost:5173` in your browser.
2. Click **"Sign In"** or use the quick demo account buttons on the login page.
3. As **Alex Rivera (Job Seeker)**, browse jobs to see transparent 100% skill match score calculations. Apply for open positions and check your real-time application timeline.
4. Open a second browser or incognito window and sign in as **Recruiter (`recruiter@techcorp.com`)**.
5. Observe real-time applicant notifications fire instantly via Socket.IO. Shortlist candidates, schedule video interviews, or initiate live chat messages.
