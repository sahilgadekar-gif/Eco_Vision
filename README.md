# 🌿 EcoVision — Carbon Footprint Tracker

<div align="center">

![EcoVision Banner](https://img.shields.io/badge/EcoVision-Carbon%20Tracker-22c55e?style=for-the-badge&logo=leaf&logoColor=white)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A modern, full-stack, responsive web application built with React.js, Node.js, Express, MongoDB, Tailwind CSS, and Three.js 3D Globe visualization.**

[Live Demo](http://localhost:5173) · [API Health](http://localhost:5000/api/health)

</div>

---

## ✨ Highlights & Key Features

| Feature | Description |
|---|---|
| 🌍 **3D Interactive Eco Globe** | Rotatable 3D planet on the home page with live eco nodes & satellite orbits |
| 📸 **Tree Plantation Tracker** | WebCam camera photo snap & upload to log planted trees and track CO₂ offsets |
| 🧮 **Carbon Calculator** | 4-step emission wizard (transport, energy, food, lifestyle) with personalized eco scores |
| 🔐 **Full-Stack Authentication** | REST API JWT auth, bcrypt password hashing, with MongoDB & JSON file fallbacks |
| 🌬️ **Air Quality Monitor** | Real-time AQI monitoring via WAQI public API with pollutant breakdowns |
| 📊 **Dashboard & Analytics** | Interactive Recharts area trend charts, progress rings, and AI eco recommendations |
| 📅 **History Management** | Record calculations, preview past reports, delete entries, and clear history |
| 👤 **User Profile & Badges** | Achievements system, avatar initial generation, profile bio, and password updates |
| ⚙️ **Settings & Preferences** | Dark/Light themes, unit conversions (kg vs tonnes), density, and JSON data export |
| 🎨 **Glassmorphism Aesthetic** | Tailored dark eco design system with particle effects and smooth micro-animations |

---

## 🛠️ Tech Stack

```
Frontend:     React 19 + Vite 5
Styling:      Tailwind CSS 3 (Custom Eco Glassmorphism Theme)
3D Model:     Canvas 3D Math Engine / Three.js
Routing:      React Router v7
Charts:       Recharts
Icons:        Lucide React
Toast:        React Hot Toast
HTTP Client:  Axios (with JWT Interceptors)

Backend:      Node.js + Express
Database:     MongoDB + Mongoose ODM (with persistent JSON file fallback)
Security:     JWT Authentication (jsonwebtoken), bcryptjs password hashing
File Upload:  Multer (Disk Storage for plantation photos)
Cross-Origin: CORS enabled
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (Optional: if offline, the backend automatically runs in persistent JSON storage fallback mode!)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/sahilgadekar-gif/Eco_Vision.git
cd Eco_Vision

# Install Frontend Dependencies
npm install

# Install Backend Dependencies
cd backend
npm install
cd ..
```

### 2. Run Application (Frontend + Backend Concurrently)
```bash
npm run dev:all
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📡 REST API Architecture

```
POST   /api/auth/register       → Register user (bcrypt hashed password)
POST   /api/auth/login          → Login user & return signed JWT token
GET    /api/auth/me             → Validate token & restore active session

GET    /api/trees               → Fetch logged tree plantations & CO₂ offset stats
POST   /api/trees               → Upload tree photo & log plantation (multipart/form-data)
PUT    /api/trees/:id           → Update plantation details
DELETE /api/trees/:id           → Delete plantation record & cleanup image file

GET    /api/calculations        → Fetch carbon footprint calculation history
POST   /api/calculations        → Save calculation entry
DELETE /api/calculations/:id    → Delete calculation entry
DELETE /api/calculations        → Clear all calculation history

GET    /api/settings            → Fetch user settings
PUT    /api/settings            → Update user settings
GET    /api/health            → Backend server health check
```

---

## 🧮 Carbon Emission Factors & Offset Math

### Emission Factors
- **Car/Motorcycle**: `0.21 kg CO₂ / km`
- **Flights**: `255 kg CO₂ / hour`
- **Electricity**: `0.233 kg CO₂ / kWh`
- **Natural Gas**: `2.0 kg CO₂ / m³`
- **Vegan Diet**: `1,500 kg CO₂ / year`
- **Vegetarian**: `1,700 kg CO₂ / year`
- **Mixed Diet**: `2,500 kg CO₂ / year`
- **Heavy Meat**: `3,300 kg CO₂ / year`

### Tree Sequestration Offset Math
- Each mature tree offsets **~21 kg CO₂ / year**.
- Lifetime offset (20-year lifespan): `treeCount × 21 × 20 kg CO₂`.

---

## 📁 Repository Structure

```
Eco_Vision/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js   # Auth endpoints logic
│   │   ├── calculationController.js # Calculation history logic
│   │   ├── settingsController.js    # Settings endpoints logic
│   │   ├── treePlantationController.js # Tree plantation CRUD & stats
│   │   └── userController.js   # Profile & password management
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   ├── upload.js           # Multer image upload middleware
│   │   └── validate.js         # Express-validator handler
│   ├── models/
│   │   ├── Calculation.js      # Mongoose Calculation schema
│   │   ├── TreePlantation.js   # Mongoose TreePlantation schema
│   │   └── User.js             # Mongoose User schema with bcrypt pre-save
│   ├── routes/
│   │   ├── auth.js
│   │   ├── calculations.js
│   │   ├── settings.js
│   │   ├── trees.js
│   │   └── users.js
│   ├── uploads/                # Plantation image uploads folder
│   ├── .env                    # Backend environment config
│   ├── package.json
│   └── server.js               # Express server entry point
├── src/
│   ├── components/
│   │   ├── layout/             # AppLayout, Sidebar
│   │   └── ui/                 # EcoGlobe3D, StatCard, ProgressRing, etc.
│   ├── context/
│   │   ├── AuthContext.jsx     # Dual-mode authentication provider
│   │   └── ThemeContext.jsx    # Dark/light mode theme provider
│   ├── pages/
│   │   ├── AirQuality.jsx      # WAQI API AQI search page
│   │   ├── Calculator.jsx      # Carbon calculator wizard
│   │   ├── Dashboard.jsx       # Analytics dashboard
│   │   ├── History.jsx         # Footprint history table
│   │   ├── Landing.jsx         # Home page with 3D Eco Globe
│   │   ├── Login.jsx           # JWT login page
│   │   ├── NotFound.jsx        # 404 error page
│   │   ├── Profile.jsx         # User profile & badges
│   │   ├── Register.jsx        # Signup page
│   │   ├── Settings.jsx       # User preferences page
│   │   └── TreePlantation.jsx  # Tree plantation tracker with camera snap
│   ├── services/
│   │   ├── api.js              # Axios HTTP client with JWT interceptor
│   │   └── storage.js          # LocalStorage fallback service
│   ├── App.jsx                 # Application router
│   └── index.css               # Tailwind CSS & glassmorphism theme
├── .gitignore
├── package.json                # Root package.json with dev:all script
└── README.md
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">

Made with 💚 for a greener tomorrow.

*"The Earth does not belong to us. We belong to the Earth."*

</div>
