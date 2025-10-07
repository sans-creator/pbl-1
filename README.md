# 🎟️ Auditorium Event Booking System (Full-Stack MERN)

A complete **full-stack web application** that allows students and admins to manage and book university auditorium events with real-time seat layouts.  
Built for our **department’s Software Development Club (SDC)** to streamline event management and bookings efficiently.

---

## 🚀 Features

- 👥 **User Authentication:** Separate flows for Students and Admins  
- 🗓️ **Event Management:** Create, edit, view, and delete events  
- 🪑 **Auditorium Seat Layouts:** Zone-wise seat segregation for different auditoriums  
- 🎫 **Seat Booking:** Real-time booking with seat locking to prevent double booking  
- 🧾 **Admin Dashboard:** Manage events, auditoriums, and view reports  
- 🎓 **Student Dashboard:** View events, select seats, and confirm bookings  
- 📧 **Email Confirmation:** Booking confirmation via email using Nodemailer  

---

## 🧠 Novelty of the Idea

This system is being developed **for our department** and used by the **Software Development Club (SDC)** to organize and manage college auditorium events.  
Unlike traditional manual seat allotment, our solution introduces:

- 🧩 **Pre-defined dynamic layouts** for multiple auditoriums (TMA Pai, Ramdas Pai, Sharda Pai)  
- 🕓 **Real-time seat availability** using database synchronization  
- 🧠 **Role-based dashboards** for both students and admins  
- 🔒 **JWT-based secure access** to event management  
- 📊 **Admin insights** on bookings and seat utilization  

This project blends **event management + seat allocation + automation**, customized specifically for **college-level departmental use**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| 🎨 **Frontend** | React, Vite, TailwindCSS |
| ⚙️ **Backend** | Node.js, Express.js |
| 🗄️ **Database** | MongoDB (Mongoose) |
| 🔐 **Authentication** | JWT |
| 🌐 **HTTP Client** | Axios |
| 🧭 **Routing** | React Router |
| ✉️ **Email** | Nodemailer |
| 🧹 **Code Quality## 🚀 Usage

### 👩‍🎓 For Students
- Register/Login using your university email  
- View upcoming events  
- Choose auditorium and seat  
- Confirm booking and receive confirmation email  

### 👨‍💼 For Admins
- Create, edit, or delete events  
- Manage auditoriums and seat layouts  
- View reports and statistics  

🪄 **Booking Flow:**  
`Select Event → Choose Auditorium → Pick Seat → Confirm Booking → Receive Email`

---

## 🔗 API Overview

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/register` | Register a student |
| POST | `/api/auth/login` | Login (student/admin) |
| GET | `/api/events` | Fetch all events |
| POST | `/api/events` | Create event (admin only) |
| PUT | `/api/events/:id` | Edit event |
| DELETE | `/api/events/:id` | Delete event |
| POST | `/api/events/:id/book` | Book a seat |
| GET | `/api/auditoriums` | Get auditorium layouts |
| GET | `/api/reports` | Fetch reports (admin only) |

---

## 🧩 Project Details

### 🎭 Auditorium Layouts
Defined in `/backend/config/auditoriumLayouts.js`:

| Auditorium | Zones | Seats per Row |
|-------------|--------|----------------|
| **TMA PAI** | A–E | 10 |
| **RAMDAS PAI** | A–D | 8 |
| **SHARDA PAI** | A–C | 6 |

---

### 🧱 Models
- **User:** Students & Admins (password hashed with bcrypt, JWT auth)  
- **Event:** Title, description, date, auditorium, seat layout  
- **Booking:** User, event, seat numbers, timestamp  

---

### ⚙️ Controllers
- `authController.js` → Handles registration/login  
- `eventController.js` → CRUD operations for events  
- `auditoriumController.js` → Layouts API  
- `bookingController.js` → Booking logic  
- `adminController.js` → Reports & analytics  

---

### 🧩 Middleware
- `authMiddleware.js` → Route protection (JWT)  
- `errorMiddleware.js` → Centralized error handler  

---

### 🛠️ Utilities
- `sendEmail.js` → Email confirmations using Nodemailer  

---

## 💻 Frontend Highlights
- ⚡ **React + Vite** setup for blazing performance  
- 🎨 **TailwindCSS** for responsive design  
- 🧭 **React Router** for navigation  
- 🧠 **Context API** for global authentication state  
- 🧩 **Reusable Components:** SeatSelector, Modals, Layouts  
- 🌈 **Clean, modern UI** for Students and Admins
** | ESLint |

---
Show Your Support

If you like this project, please ⭐ star the repo on GitHub and share it with your peers!
Your feedback and contributions are welcome.

