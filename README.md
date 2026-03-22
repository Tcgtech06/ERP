# Task Management System with Firebase

Internal task assignment and tracking system with 4 user modules powered by Firebase.

## Features

- **Firebase Authentication** - Secure user login with email/employee ID
- **Firestore Database** - Real-time data synchronization
- **4 User Roles:**
  1. **Client** - Creates and tracks tasks
  2. **Admin** - Assigns tasks to employees
  3. **Employee** - Updates task status (Software/Digital Marketing/BDO)
  4. **Super Admin** - Full system control

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Run development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

## Login Credentials

- **Super Admin:** superadmin@tcg.com / tcgtech@01
- **Admin:** TCGadmin01 / admin@01
- **Client:** client@tcg.com / client@123
- **Software Employee:** TT001 / TCGT202601
- **Digital Marketing:** TD001 / TCGD202601
- **BDO Employee:** TB001 / TCGB202601

## Firebase Configuration

The app is connected to Firebase project: `tcgerp-b7765`

- Authentication: Email/Password
- Database: Cloud Firestore
- Analytics: Google Analytics

## Deployment

Deploy to any static hosting:
- **Netlify:** Connect GitHub repo
- **Vercel:** Import from GitHub
- **Firebase Hosting:** `firebase deploy`

## Tech Stack

- React 18
- Vite
- Firebase 10
- Tailwind CSS
- Lucide Icons
