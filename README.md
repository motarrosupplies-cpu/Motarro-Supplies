# My v0 Project

A modern web application built with **Next.js**, **React**, and **TypeScript**.  
Primary development is on **Windows 10+ (PowerShell)**, but the project is cross-platform.

---

## 🚀 Main Technologies

- **Next.js** (v15+)
- **React** (v19+)
- **TypeScript** (v5+)
- **Tailwind CSS** (v3+)
- **Prisma** (v6+)
- **PostgreSQL** (recommended, e.g., via pgAdmin)
- **Radix UI**, **Recharts**, **react-dropzone**, and more

---

## 🖥️ Primary Development OS

- **Windows 10+**
- PowerShell is used for CLI commands (see below for Windows-specific instructions).

---

## 📦 Key Dependencies

See `package.json` for the full list. Major dependencies include:

- `next`, `react`, `react-dom`
- `@prisma/client`, `prisma`
- `tailwindcss`, `postcss`
- `@radix-ui/*` (UI components)
- `recharts`, `react-dropzone`, `lucide-react`
- `zod`, `react-hook-form`, `date-fns`, etc.

---

## ⚙️ Setup & Build Instructions

### 1. **Clone the repository**
```sh
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. **Install dependencies**
```powershell
npm install
# or
yarn install
```

### 3. **Configure Environment**
- Copy `.env.example` to `.env` and fill in your environment variables (e.g., database connection string for PostgreSQL).
- **Supabase**: For admin features (menu management, blog image upload, order creation), set `SUPABASE_SERVICE_ROLE_KEY` in `.env` and in Vercel. The anon key is used for public routes; the service role bypasses RLS and is required for admin APIs.

### 4. **Database Setup**
- Ensure PostgreSQL is running (e.g., via pgAdmin).
- Run Prisma migrations and generate client:
  ```powershell
  npx prisma generate
  npx prisma db push --accept-data-loss
  ```

### 5. **Build the app**
```powershell
npm run build
```

### 6. **Start the app**
```powershell
npm start
```

### 7. **Development mode**
```powershell
npm run dev
```

### 8. **Clean previous builds (Windows/PowerShell)**
```powershell
Remove-Item -Recurse -Force .next
```

---

## 📝 Notes

- For **Linux/macOS**, use `rm -rf .next` to clean builds.
- All dependencies and scripts are defined in `package.json`.
- If you add new dependencies, always run `npm install` and update this README if needed.
- For deployment, always follow the build steps above to avoid stale or broken builds.

--- 

# Trivial change to force git commit and push for logo update verification. 