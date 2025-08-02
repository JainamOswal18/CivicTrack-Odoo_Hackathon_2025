# CivicTrack: Civic Issue Reporting Platform

Empower communities to report, track, and resolve local civic issues with CivicTrack—a responsive full-stack web application built from scratch using Node.js, Express, SQLite, React, and Leaflet.  

## 🚀 Project Overview

CivicTrack enables residents to:
- **Report** potholes, broken streetlights, water leaks, garbage overflows, obstructions, and public safety hazards within their 3–5 km neighborhood.
- **View** nearby issues on an interactive map with intuitive markers color-coded by category and status.
- **Filter** issues by distance, category, and status; search by keywords.
- **Flag** spam or invalid reports for admin review and auto-hide issues flagged by multiple users.
- **Receive** real-time notifications as new issues are reported or statuses are updated.
- **Administer** user bans, review flagged issues with full context (images, descriptions, timestamps), and access analytics (total issues, counts by category/status).

## 🔧 Tech Stack

| Layer            | Technology                               | Rationale                                           |
|------------------|------------------------------------------|-----------------------------------------------------|
| Backend          | Node.js, Express.js                      | Fast, modular API server; middleware support        |
| Authentication   | JWT (jsonwebtoken), Bcrypt               | Stateless, secure token-based auth; password hashing|
| Database         | SQLite (file-based) + Spatial Index      | Zero-config local DB; efficient geospatial filtering|
| File Uploads     | Multer                                   | Robust handling of image attachments                |
| Real-Time        | Socket.io                                | Live notifications by geographic “rooms”            |
| Frontend         | React, TypeScript                        | Component-based UI; type safety                     |
| Mapping          | React-Leaflet + OpenStreetMap tiles      | Free, offline-friendly interactive maps             |
| Forms & Routing  | React Hook Form, React Router            | Declarative forms; client-side navigation           |
| HTTP Client      | Axios                                    | Promise-based API calls                              |
| Validation & Security | express-validator, Helmet, rate-limit | Input sanitization; secure headers; rate limiting   |
| Environment      | dotenv                                   | Centralized configuration                            |


## ⚡ Key Features

1. **From-Scratch Backend**  
   - Full RESTful API design without BaaS dependencies  
   - Local SQLite with spatial indexing for fast geofencing  

2. **Interactive Mapping**  
   - React-Leaflet integration for zoom, pan, custom SVG markers  
   - Real-time marker updates via Socket.io “location” rooms  

3. **Robust Validation & Security**  
   - express-validator enforces strong input rules  
   - JWT middleware for protected routes; Bcrypt for credentials  
   - helmet & express-rate-limit guard against common threats  

4. **User & Admin Workflows**  
   - Anonymous or verified reporting  
   - Flagging system with auto-hide after ≥ 3 flags  
   - Admin routes for banning users, unflagging, and analytics  

## ⚙️ Setup & Run

1. **Clone & Install**  
   
bash
   git clone 
   cd civictrack
   # Backend
   cd backend && npm install
   # Frontend
   cd ../frontend && npm install


2. **Configure Environment**  
   - Copy .env.example to .env in both /backend and /frontend.  
   - Set JWT_SECRET, FRONTEND_URL, REACT_APP_API_URL, and other keys.

3. **Start Development Servers**  
   
bash
   # Backend
   cd backend && npm run dev  
   # Frontend
   cd frontend && npm start


## 📈 Future Enhancements

- **Persistent Cloud DB**: Migrate SQLite to PostgreSQL for true horizontal scaling and replication.
- **Map Clustering**: Aggregate dense marker regions for better UX.
- **Push Notifications**: Browser/mobile push via Firebase Cloud Messaging.
- **User Profiles**: Personal dashboards with contribution stats.
- **Role-Based Access**: Granular permissions for moderators and super-admins.
- **Offline Support**: Service workers and IndexedDB caching for seamless offline reporting.
