# Organick — Organic Food E-Commerce

A full-featured organic food store built with React 19, TypeScript, Redux Toolkit, Tailwind CSS v4, Firebase Auth, and i18next.

---

## Features

- **Multilingual (i18n)**: Uzbek (default), English, Russian — powered by i18next with localStorage persistence
- **Dark / Light Mode**: Class-based Tailwind v4 dark mode, toggled from the navbar
- **Responsive Design**: Mobile-first layout with hamburger drawer, tablet/desktop breakpoints
- **Product Catalog**: Category filters, search, sort, add-to-cart
- **Product Detail Page**: Interactive star ratings, quantity selector, related products (`/shop/:id`)
- **Shopping Cart**: Slide-in sidebar + full cart page, persistent via localStorage
- **Authentication** (Firebase):
  - Google Sign-In (popup)
  - Email / Password (register + login)
  - Phone Number with SMS OTP
- **Admin Dashboard** (protected): Product CRUD, Blog CRUD, rating management
- **Blog & Portfolio** pages
- **Contact Form**: Sends messages to a Telegram group via Bot API
- **Newsletter**: Telegram Bot subscription
- **Netlify-ready**: `netlify.toml` + `public/_redirects` for SPA routing

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 + Motion |
| Icons | FontAwesome 7 |
| State | Redux Toolkit 2 |
| Routing | React Router v7 |
| Auth | Firebase 12 (Google, Email, Phone) |
| i18n | i18next 26 + react-i18next 17 |
| Build | Vite 8 |
| Deploy | Netlify |

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Abdulmajidkhan007/Organick_org.git
cd Organick_org
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

`.env.example` contains all required keys — see the [Environment Variables](#environment-variables) section below.

> **Never commit `.env` to git.** It is already listed in `.gitignore`.

### 3. Run Dev Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

---

## Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# ===== TELEGRAM BOT =====
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_GROUP_ID=your_group_id_here
VITE_TELEGRAM_THREAD_ID=your_thread_id_here

# ===== FIREBASE =====
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

All variables must be prefixed with `VITE_` so Vite exposes them to the browser.

---

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in methods:
   - Google
   - Email/Password
   - Phone
3. Copy the Web App config values into your `.env`
4. For Phone auth, ensure your domain is added to **Authorized Domains** in Firebase Console

### Admin Access

Open `src/firebase/auth.ts` and add admin email addresses to the `ADMIN_EMAILS` array:

```typescript
export const ADMIN_EMAILS = [
  'admin@organick.com',
  'your-email@example.com',
]
```

Users whose Firebase email matches an entry in this list will have `isAdmin: true` set in Redux state and can access `/admin`.

---

## Telegram Bot Setup

1. Create a bot via [@BotFather](https://t.me/BotFather) and copy the token
2. Add the bot to your group/supergroup
3. Get the group's chat ID (negative number for groups)
4. Optionally set a topic thread ID if using forum-style groups
5. Fill in `VITE_TELEGRAM_BOT_TOKEN`, `VITE_TELEGRAM_GROUP_ID`, `VITE_TELEGRAM_THREAD_ID` in `.env`

---

## Project Structure

```
src/
├── assets/          # Images (Shop, Service, Blog, etc.)
├── Components/
│   ├── Admin/       # Admin Dashboard (CRUD)
│   ├── Auth/        # AuthPage (Google, Email, Phone)
│   ├── Navbar.tsx
│   ├── CartSidebar.tsx
│   ├── Shop.tsx / ShopSingle.tsx
│   └── ...
├── firebase/
│   ├── config.ts    # Firebase app init
│   └── auth.ts      # Auth helpers + ADMIN_EMAILS
├── hooks/           # useAppDispatch / useAppSelector
├── i18n/
│   ├── index.ts
│   └── locales/     # uz.json, en.json, ru.json
├── slices/          # cartSlice, authSlice, uiSlice
├── types/           # TypeScript interfaces
├── Data.ts          # Products/blogs data + Redux slice
├── Store.ts         # Redux store
├── App.tsx
└── main.tsx
```

---

## Deployment on Netlify

1. Push the branch to GitHub
2. Connect the repository to Netlify
3. Set **Build command**: `npm run build` and **Publish directory**: `dist`
4. Add all `.env` variables in **Netlify → Site Settings → Environment Variables**
5. Deploy

The `netlify.toml` and `public/_redirects` files already handle SPA client-side routing.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## License

MIT
