# VaultHub

<div align="center">
  <img src="https://img.shields.io/badge/VaultHub-Secure%20File%20Sharing-2563eb?style=for-the-badge&logo=files&logoColor=white" alt="VaultHub" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
</div>

<br />

<p align="center">
  <strong>Secure file sharing with client-side encryption, expiring links, and download tracking.</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-prototype-vision">Prototype Vision</a> •
  <a href="#-setup">Setup</a> •
  <a href="#-how-it-works">How it Works</a>
</p>

---

## 🌟 Overview

VaultHub is a privacy-first file sharing platform built for one purpose: make sharing sensitive files simple, secure, and clean.

Users can upload files, encrypt them in the browser, generate shareable links, and control access using expiry rules, download limits, and password-protected access. The project combines a polished product vision with a practical full-stack implementation.

---

## 🖼️ Hero Banner / Product Mood

> **VaultHub feels like a locked vault for your files — elegant on the outside, secure at the core.**
>
> Share files with confidence, protect them with encryption, and keep control from upload to download.

---

## 🚀 Why VaultHub?

Most file-sharing tools optimize for convenience first and privacy second. VaultHub is built differently.

- 🔐 **Encryption first** — files are protected before they leave the browser
- ⏳ **Access control** — links can expire and downloads can be limited
- 📥 **Download visibility** — track activity and monitor file access
- 🛡️ **Password protection** — add another layer of security for sensitive files
- ☁️ **Storage separation** — metadata, access logic, and file delivery are handled cleanly

VaultHub is designed for people sharing contracts, documents, creative assets, and other private files that should not be exposed in plain text.

---

## ✨ Features

| Feature | What it does |
|---|---|
| 🔐 Client-side encryption | Encrypt files locally before upload |
| 🔗 Shareable links | Generate token-based access links |
| ⏳ Expiring files | Set deadlines for access |
| 📥 Download tracking | Log download attempts and usage |
| 🛡️ Password-protected access | Require a password for encrypted files |
| 🗄️ Metadata storage | Store file details in PostgreSQL via Prisma |
| ☁️ File delivery | Serve downloads through AWS S3 |
| 🧾 Dev tooling | Local setup script and Docker-based database |

---

## 🎨 Prototype Vision

The included prototype shows the intended experience and product direction for VaultHub.

### What the prototype communicates
- modern dark/light UI
- drag-and-drop file upload
- optional encryption toggle
- password-based download flow
- activity log dashboard
- privacy-first storytelling
- clean, premium interactions

### What to expect in the final product
The final implementation may use a different technical stack or evolve over time, but the core idea stays the same:

> **Upload → Encrypt → Share → Download → Track**

---

## 🧩 Feature Cards

### 🔐 Secure Uploads
Encrypt files locally in the browser before they are shared.

### 🔗 Shareable Access
Each file gets a unique token link that can be sent to recipients.

### ⏳ Time-Limited Sharing
Set expiration rules so links do not live forever.

### 📊 Download Insights
Track who accessed files and when through activity logs.

### ☁️ Reliable Storage
Use cloud storage for file delivery while keeping metadata structured in the database.

### 🛡️ Protected Downloads
Encrypted files require the correct password before access is granted.

---

## 🧱 Stack

### Implemented stack
- **Frontend:** React, TypeScript, Vite
- **Backend:** Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Storage:** AWS S3
- **Local setup:** Docker / Docker Compose

### Product / UX direction
- responsive web interface
- dark/light theme concept
- upload, download, and activity screens
- privacy-focused language
- polished onboarding flow

---

## 📸 Screenshots

> Screenshots can be added here later when the UI is ready.

For now, the prototype file in the repo serves as the visual reference for the product experience.

Suggested future additions:
- upload screen
- encrypted upload progress
- download screen
- activity log page
- privacy/about pages

---

## 📁 Repository Structure

```text
backend/
  src/
    server.ts          # API routes, download checks, metadata handling
    lib/               # Prisma client and backend helpers
    services/          # S3 download URL generation
  prisma/
    schema.prisma      # File and ActivityLog database models
    seed.ts            # Local seed data for development

frontend/
  src/
    App.tsx            # Router and page shell
    pages/             # Download page UI
    lib/api.ts         # Frontend API client
    components/        # Shared UI components

docs/
  Person_B_Progress.md # Development notes and progress log
```

---

## 🔄 How it Works

1. A user uploads a file through the frontend.
2. The file is encrypted in the browser before being sent to storage.
3. The backend stores metadata in PostgreSQL and keeps the file in S3.
4. A unique share link is generated for the recipient.
5. The recipient opens the link and the backend validates token, expiry, and download limits.
6. If the file is encrypted, the recipient enters the password before downloading.
7. Each download attempt is logged for later review.

---

## 🛠️ Setup

### Start PostgreSQL

```bash
docker-compose up -d
```

### Prepare the project

```bash
chmod +x setup.sh
./setup.sh
```

### Run the backend

```bash
cd backend
npm run dev
```

### Run the frontend

```bash
cd frontend
npm run dev
```

---

## 🔧 Environment Variables

You will likely need:

- `DATABASE_URL`
- AWS credentials for S3 access
- any additional values defined in `.env` or `.env.example`

---

## 🖥️ UI Prototype Notes

The HTML prototype in the repo shows the intended experience with:

- upload and download views
- activity log page
- about and privacy sections
- encryption/decryption progress states
- file metadata cards
- password entry flow
- responsive navigation and theme switching

It acts like a product mockup for contributors and helps explain the long-term vision of VaultHub.

---

## 🤝 Team

- **Naveen** — Upload & Encryption
- **Rahul** — Download & Security

---

## 📄 License

MIT
