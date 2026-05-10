# Mizaniti - Professional Finance Management

A full-stack application for tracking freelancer income, expenses, projects, and debts.

## 🚀 Quick Start

To run this application on your local machine:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (Version 20 or higher)
- [npm](https://www.npmjs.com/)

### 2. Setup
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to `.env` and fill in your Firebase credentials:
```bash
cp .env.example .env
```
*Note: You can get these credentials from your Firebase Console project settings.*

### 4. Run Development Server
Starts both the Express backend and Vite frontend with HMR:
```bash
npm run dev
```

### 5. Build for Production
Compiles the TypeScript code and prepares static assets:
```bash
npm run build
npm start
```

## 🏗 Architecture
- **Backend**: Node.js + Express (Integrated with Vite middleware)
- **Frontend**: React + Tailwind CSS + Lucide Icons + Motion
- **Database/Auth**: Firebase (Cloud Firestore & Firebase Auth)
- **Design**: Professional Dark UI with "Brand Emerald" accents

## 🔐 Security
- **Firestore Security Rules**: Hardened ABAC (Attribute-Based Access Control)
- **Identity Integrity**: All writes are validated against the authenticated user's UID.
- **Master Gate Pattern**: Strict relational synchronization for sub-resources.
