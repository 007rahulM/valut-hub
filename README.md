# VaultHub

<div align="center">

![VaultHub](https://img.shields.io/badge/VaultHub-Secure%20File%20Sharing-2563eb?style=for-the-badge&logo=files&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

**Secure file sharing platform with client-side encryption, expiring links, and download tracking.**

</div>

---

## Overview

VaultHub is a secure file sharing platform designed to make private file transfer simple and controlled.
It lets users encrypt files in the browser, share them through token-based links, and manage access using expiry rules and download limits.

The project includes a React + TypeScript frontend, an Express + Prisma backend, PostgreSQL for metadata storage, and AWS S3 for file delivery.

---

## What VaultHub solves

Sharing sensitive files through email or generic cloud links can be risky.
VaultHub is built around a privacy-first flow so that:

- files are encrypted before upload
- access can be limited by time or download count
- encrypted files can require a password
- download attempts can be tracked
- the share link stays simple for recipients

---

## Prototype vision

The repository also includes a UI prototype that shows the intended product experience.
It highlights the direction of the app more than the current production-ready scope.

### Prototype flow
1. Upload a file
2. Optionally encrypt it in the browser
3. Generate a shareable link
4. Recipient opens the download page
5. Password is entered if needed
6. Download activity is recorded

### Prototype pages
- Upload page
- Download page
- Activity log page
- About page
- Privacy page

---

## Features

- 🔐 Client-side file encryption
- 🔗 Token-based share links
- ⏳ Expiring file access
- 📥 Download tracking and activity logs
- 🛡️ Password-protected download flow
- ☁️ AWS S3-backed file delivery
- 🗄️ PostgreSQL metadata storage via Prisma
- 🧾 Local setup script for development

---

## Stack

### Implemented stack
- **Frontend:** React, TypeScript, Vite
- **Backend:** Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Storage:** AWS S3
- **Local development:** Docker / Docker Compose

### UI prototype stack
- HTML
- CSS
- JavaScript

---

## Repository structure

```text
backend/
  src/
    server.ts          # API routes and download validation
    lib/               # Prisma client and backend helpers
    services/          # S3 download URL logic
  prisma/
    schema.prisma      # File and ActivityLog models
    seed.ts            # Development seed data

frontend/
  src/
    App.tsx            # Router and shell
    pages/             # Download page UI
    lib/api.ts         # API client
    components/        # Shared UI pieces

docs/
  Person_B_Progress.md # Development notes and progress log
```

---

## How it works

1. A file is uploaded from the frontend.
2. The file is encrypted in the browser before upload.
3. The backend stores metadata in PostgreSQL.
4. The actual file is stored in S3.
5. A unique token link is created for sharing.
6. When a recipient opens the link, the backend validates token, expiry, and download rules.
7. If the file is encrypted, the recipient must provide the password.
8. Each successful download is logged.

---

## Setup

### Start PostgreSQL

```bash
docker-compose up -d
```

### Install project dependencies and prepare the repo

```bash
chmod +x setup.sh
./setup.sh
```

### Start the backend

```bash
cd backend
npm run dev
```

### Start the frontend

```bash
cd frontend
npm run dev
```

---

## Environment variables

You will likely need:

- `DATABASE_URL`
- AWS credentials for S3 access
- other values defined in `.env` or `.env.example`

---

## UI prototype notes

The included HTML prototype is a visual reference for the intended product experience.
It shows the upload, download, activity, privacy, and about pages in a polished demo-style layout.

It is useful for understanding the long-term product direction even if parts of the final implementation differ.

---

## Team

- **Naveen** — Upload & Encryption
- **Rahul** — Download & Security

---

## License

MIT
