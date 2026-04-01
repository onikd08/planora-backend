# Planora Backend 🚀

![Planora Banner](assets/banner.png)

Welcome to the **Planora Backend**, a high-performance, scalable API built for modern event management and participation. This backend powers the Planora ecosystem, providing robust features for users, event organizers, and administrators.

---

## 🛠️ Tech Stack

Planora is built with a modern and powerful tech stack designed for speed, reliability, and security:

- **Core Framework**: [Express.js v5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/) (Modular Schema setup)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: JWT (JSON Web Tokens) with Cookies & Bcrypt
- **Payments**: [Stripe](https://stripe.com/) (Checkout & Webhooks)
- **Validation**: [Zod](https://zod.dev/)
- **Build Tool**: [Tsup](https://tsup.madewitho.com/)
- **Deployment**: Optimized for [Vercel](https://vercel.com/)

---

## ✨ Key Features

- **🔐 Secure Authentication**: Role-based access control (Admin/User), JWT-based auth with secure cookie handling.
- **📅 Event Management**: Full CRUD for events, category-based filtering, and featured event handling.
- **🎟️ Participation System**: Seamless event registration and slot management.
- **💳 Payment Integration**: Integrated Stripe for event bookings with automated webhook handling.
- **📊 Admin Dashboard**: Comprehensive statistics and management tools for administrators.
- **⭐ Reviews & Ratings**: User feedback system for events.
- **🛡️ Error Handling**: Centralized global error handling with specific Zod validation error parsing.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) instance
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (for local webhook testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd planora-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add the following:
   ```env
   NODE_ENV=development
   PORT=4000
   DATABASE_URL=your_postgresql_url
   JWT_ACCESS_SECRET=your_secret
   JWT_REFRESH_SECRET=your_secret
   FRONTEND_URL=http://localhost:3000
   STRIPE_SECRET_KEY=your_stripe_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Prisma Setup:**
   ```bash
   npm run generate
   npm run migrate
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

- `npm run dev`: Starts the development server using `tsx`.
- `npm run build`: Generates Prisma client and builds the project using `tsup`.
- `npm run start`: Starts the built application from `dist/`.
- `npm run studio`: Launches Prisma Studio to explore your database.
- `npm run stripe:webhook`: Proxies Stripe webhooks to your local server.
- `npm run seed-admin`: Seeds a default administrator account.

---

## 🛤️ API Endpoints (v1)

| Prefix | Description |
| :--- | :--- |
| `/api/v1/auth` | Login, Registration, Password Management |
| `/api/v1/users` | User profile and management |
| `/api/v1/events` | Event creation, listing, and details |
| `/api/v1/event-categories` | Manage event categories |
| `/api/v1/participations` | Event registrations and tickets |
| `/api/v1/reviews` | Post and view event reviews |
| `/api/v1/dashboard` | Administrative and user statistics |
| `/webhook` | Stripe Webhook Endpoint (Root level) |

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── config/          # Environment variables and configurations
│   ├── lib/             # Third-party library initializations (Prisma, Stripe)
│   ├── middleware/      # Global middlewares (Auth, Error handling)
│   ├── module/          # Domain-driven feature modules (User, Event, Payment, etc.)
│   ├── routes/          # API route definitions
│   └── errorHelpers/    # Custom error formatting utilities
├── server.ts            # Entry point for the application
└── app.ts               # Express app configuration
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

Developed with ❤️ for the Planora Ecosystem.
