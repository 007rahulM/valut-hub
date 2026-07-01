# Person B Progress Log

## 2026-06-25 (Week 1, Day 1)

### What I Did Today

#### 1. Project Setup
- [x] Created React + TypeScript project with Vite (`npm create vite@latest`)
- [x] Installed dependencies (`npm install`)
- [x] Installed React Router (`npm install react-router-dom`)
- [x] Attempted Tailwind CSS install (encountered issues, switched to inline styles for now)

#### 2. DownloadPage Component
- [x] Created `src/pages/DownloadPage.tsx`
- [x] Built file metadata interface (TypeScript): originalName, mimeType, sizeBytes, isEncrypted, expiresAt, downloadCount
- [x] Implemented `formatFileSize()` helper function (bytes → KB/MB/GB)
- [x] Added loading state with `useState(true)` and `useEffect` with `setTimeout` to simulate API call
- [x] Added error state handling (ready for real API errors)
- [x] Used `useParams&lt;{ token: string }&gt;()` to read token from URL (`/file/:token`)
- [x] Conditional rendering: loading spinner → error message → file info card
- [x] Displayed file info: name, type, size, expiration date, encryption status, download count
- [x] Conditionally showed password input only when `isEncrypted` is true
- [x] Added "Download File" button (placeholder for now, no real download yet)
- [x] Displayed token at bottom for debugging

#### 3. App.tsx Router Setup
- [x] Set up `BrowserRouter` and `Routes`
- [x] Added route for `/file/:token` pointing to DownloadPage
- [x] Added placeholder route for `/` (home page, waiting for Person A's UploadPage)

#### 4. Styling Journey
- [x] Started with Tailwind classes (`bg-gray-100`, `rounded-lg`, etc.)
- [x] Hit Tailwind generation issue (classes not applying)
- [x] Used `body { background: hotpink }` test to verify CSS file loads
- [x] Learned about browser caching (Ctrl+Shift+R for hard refresh)
- [x] Switched to inline `style={{}}` objects when Tailwind failed
- [x] Built clean design with plain CSS-in-JS

#### 5. Git & GitHub
- [x] Initialized Git repository (`git init`)
- [x] Created GitHub repository `vault-hub-lite`
- [x] Connected local repo to GitHub (`git remote add origin ...`)
- [x] Created `.gitignore` (node_modules, .env, dist folders)
- [x] Created project folder structure (frontend/, backend/, docs/)
- [x] This is my FIRST COMMIT

### What I Learned

#### React Concepts
- **JSX**: Writing HTML-like code inside JavaScript files
- **Components**: Functions that return UI (DownloadPage is a component)
- **Props**: Not used yet, but I know they're for passing data parent→child
- **State (`useState`)**: Data that changes and makes React re-render the page
  - `const [file, setFile] = useState(null)` — starts as null, becomes data later
  - `const [loading, setLoading] = useState(true)` — starts true, becomes false when data loads
- **Effects (`useEffect`)**: Run code when something happens (like page load)
  - Empty array `[]` means "run once when component mounts"
  - Used `setTimeout` to simulate API delay (1 second)
- **useParams**: React Router hook that reads URL parameters
  - `/file/abc123` → `useParams()` gives `{ token: "abc123" }`
- **Conditional Rendering**: Show different UI based on state
  - `if (loading) return &lt;Spinner /&gt;`
  - `if (error) return &lt;ErrorMessage /&gt;`
  - Otherwise return the main page

#### TypeScript Concepts
- **Interfaces**: Define the shape of objects
  ```typescript
  interface FileMetadata {
    originalName: string;   // must be text
    sizeBytes: number;      // must be a number
    isEncrypted: boolean;   // must be true/false
  }


  
======================================================================================================

## 2026-06-26 (Week 1, Day 2)

### What I Did Today
- [x] Created backend folder with `npm init -y`
- [x] Installed Express, CORS, Prisma, TypeScript dependencies
- [x] Configured TypeScript (`tsconfig.json`) with Node.js types
- [x] Initialized Prisma ORM (`npx prisma init`)
- [x] Defined database schema in `prisma/schema.prisma`
  - File model: stores file metadata (token, name, size, encryption, etc.)
  - ActivityLog model: tracks download attempts
  - One-to-many relationship: File → ActivityLogs
- [x] Started PostgreSQL with Docker (`docker-compose up -d`)
- [x] Created first migration (`npx prisma migrate dev --name init`)
- [x] Created Prisma client singleton (`src/lib/prisma.ts`)
- [x] Built Express server (`src/server.ts`)
  - Health check endpoint: `GET /health`
  - File metadata endpoint: `GET /api/file/:token`
  - Error handling: 404 (not found), 410 (expired), 500 (server error)
- [x] Seeded test data into database (`npx prisma db seed`)
- [x] Added npm scripts: `dev`, `build`, `start`
- [x] Fixed `package.json` structure (prisma seed config inside object)
- [x] Fixed `tsconfig.json` to include Node.js types and prisma folder

### What I Learned

#### Backend Concepts
- **Express.js**: Minimal web framework for Node.js
  - `app.use()` adds middleware (runs on every request)
  - `app.get()` defines routes for specific URLs
  - `req` = request (what browser sends), `res` = response (what we send back)
  - `req.params` gets URL parameters like `:token`
- **Middleware**: Functions that process every request
  - `cors()`: allows frontend to talk to backend (different ports)
  - `express.json()`: parses JSON request bodies
- **HTTP Status Codes**:
  - 200 = OK (success)
  - 404 = Not Found (file doesn't exist)
  - 410 = Gone (file expired)
  - 500 = Server Error (something broke)

#### Database Concepts
- **PostgreSQL**: Relational database (tables, rows, columns)
- **Prisma ORM**: TypeScript-friendly database toolkit
  - Schema-first: define tables in `.prisma` file
  - Auto-generates TypeScript types
  - `findUnique()`, `create()`, `update()` — no raw SQL needed
- **Migration**: Safe way to change database structure
  - `prisma migrate dev`: create and apply migration
  - Tracks what changed, can roll back if needed
- **Seed**: Add test data to database for development
- **Singleton pattern**: Only one PrismaClient instance exists
  - Prevents database connection pool exhaustion

#### TypeScript Concepts
- **`@types/node`**: Type definitions for Node.js built-in APIs
  - Without this, TypeScript doesn't know `console` or `process`
- **`"types": ["node"]`** in tsconfig: include Node.js types
- **`"include": ["src/**/*", "prisma/**/*"]`**: tell TypeScript which files to check

#### JSON Concepts
- **Valid JSON structure**: All fields must be inside the main object
  - My mistake: put `"prisma"` outside the closing `}`
  - Fixed by moving it inside, before the final `}`

### Current Project State

| Feature | Status |
|---------|--------|
| DownloadPage UI | ✅ Working (frontend) |
| React Router | ✅ Working |
| Express server | ✅ Running on port 3001 |
| Health endpoint | ✅ Returns `{"status":"ok"}` |
| File API endpoint | ✅ Returns file metadata |
| Database connection | ✅ PostgreSQL via Docker |
| Prisma ORM | ✅ Schema defined, migrated, seeded |
| Test data | ✅ One file in database |
| Connect frontend to backend | ❌ Not started (Day 3) |

### Blockers
- None today

