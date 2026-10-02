# ZenFlow — Yoga Studio Management System

ZenFlow is a complete, full-stack MERN application for managing a yoga studio. It features role-based access control (RBAC), robust class scheduling, a smart booking system, capacity management, and interactive analytics dashboards.

## 🚀 Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form + Zod, Recharts, Lucide React
- **Backend:** Node.js 24 LTS, Express 5, MongoDB, Mongoose, JWT (HTTP-only cookies), bcrypt
- **Architecture:** Complete REST API with structured controllers, models, and middleware

---

## 📋 Prerequisites
To run this project on your local machine, you need:
1. [Node.js](https://nodejs.org/en) (v24 LTS recommended)
2. [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running on default port `27017`
3. [Git](https://git-scm.com/)

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd yoga-class-management
```

### 2. Install dependencies
The project is split into a frontend (`client`) and a backend (`server`). You must install dependencies for both.

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

### 3. Environment Variables
In the `server` directory, create a `.env` file with the following configuration:
```env
# server/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/yoga-management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

---

## 🏃‍♂️ Running the Application

### Option A: Using the PowerShell Scripts (Windows)
If you are on Windows, two handy scripts are provided in the root directory:
- `.\start.ps1` : Instantly opens two new terminal windows and boots up both the backend API and frontend Vite server.
- `.\stop.ps1` : Safely finds and stops the node processes running on the app's ports (5000, 5173, 5174).

### Option B: Manual Startup
Open two separate terminal windows.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
The application will be accessible at `http://localhost:5173` (or `5174`).

---

## 🌱 Seeding the Database (Test Accounts)
To generate initial classes, membership plans, and test users, run the seeder script from the `server` directory:

```bash
cd server
npm run seed
```

**Test Accounts Generated (Password: `Password123!` for all):**
- **Admin:** `admin@yoga.com` 
- **Instructor:** `priya@yoga.com`
- **Member:** `rahul@yoga.com`

---

## ✨ Key Features
- **Admin Dashboard:** KPIs, revenue bar charts, class popularity, user management, and system-wide visibility.
- **Instructor Dashboard:** Manage personal assigned classes, track roster capacity, and mark student attendance.
- **Member Flow:** Browse class catalogues, filter by difficulty/type, book classes (with atomic slot validation), and view active memberships.
- **Security:** Helmet headers, CORS restrictions, express-rate-limit, and secure XSS-proof JWT storage inside HTTP-only cookies.
