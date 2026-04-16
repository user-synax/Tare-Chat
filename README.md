<div align="center">

<!-- BANNER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0c29,50:302b63,100:24243e&height=200&section=header&text=tare-chat&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=Real-Time%20Chat%2C%20Reimagined&descAlignY=60&descSize=20&animation=fadeIn" width="100%"/>

<!-- BADGES ROW 1 -->
<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Pusher-Channels-300D4F?style=for-the-badge&logo=pusher&logoColor=white"/>
</p>

<!-- BADGES ROW 2 -->
<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/shadcn%2Fui-components-18181B?style=for-the-badge&logo=shadcnui&logoColor=white"/>
  <img src="https://img.shields.io/badge/PeerJS-WebRTC-00B0FF?style=for-the-badge&logo=webrtc&logoColor=white"/>
  <img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>
</p>

<!-- STATUS BADGES -->
<p align="center">
  <img src="https://img.shields.io/badge/status-live-brightgreen?style=flat-square"/>
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square"/>
  <img src="https://img.shields.io/badge/PRs-welcome-orange?style=flat-square"/>
  <img src="https://img.shields.io/badge/made%20with-❤️%20in%20India-ff6b6b?style=flat-square"/>
</p>

<br/>

> **🔗 Live Demo → [tare-chat.vercel.app](https://tare-chat.vercel.app)**

</div>

---

<div align="center">

## ✦ What is tare-chat?

</div>

**tare-chat** is a production-grade, real-time messaging platform built on the MERN stack. It brings together the best of modern web technologies — WebSockets via Socket.io and Pusher, peer-to-peer communication via PeerJS, and a clean component-driven UI with shadcn/ui — to deliver a chat experience that's fast, secure, and beautiful.

Whether you're building for a small community or scaling to thousands, tare-chat has the architecture to support it.

---

## 🌟 Features

| Feature | Description |
|---|---|
| ⚡ **Real-Time Messaging** | Instant message delivery using Socket.io + Pusher WebSocket channels |
| 🔐 **Secure Auth** | JWT-based authentication with hashed credentials |
| 🏠 **Chat Rooms** | Create, join, and manage multiple public/private rooms |
| ✍️ **Typing Indicators** | See when someone is composing a message, live |
| 📱 **Fully Responsive** | Pixel-perfect on mobile, tablet, and desktop |
| 🎨 **Clean UI** | Built with shadcn/ui + Tailwind CSS for a polished look |
| 🧩 **WebRTC (PeerJS)** | Peer-to-peer communication layer for direct connections |
| 🗃️ **Persistent Storage** | All messages and user data stored reliably in MongoDB Atlas |
| 🌐 **MERN Stack** | MongoDB · Express · React (Next.js) · Node — production-ready |

---

## 🛠️ Tech Stack

<div align="center">

```
┌─────────────────────────────────────────────────────────────────┐
│                        TARE-CHAT STACK                          │
├────────────────────┬────────────────────────────────────────────┤
│  Frontend          │  Next.js 15 (App Router) · React           │
│  Styling           │  Tailwind CSS · shadcn/ui                  │
│  Real-Time         │  Socket.io · Pusher Channels               │
│  P2P               │  PeerJS (WebRTC)                           │
│  Backend           │  Next.js API Routes · Node.js              │
│  Database          │  MongoDB · Mongoose                        │
│  Auth              │  JWT · bcrypt                              │
│  Deployment        │  Vercel                                    │
└────────────────────┴────────────────────────────────────────────┘
```

</div>

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- **Node.js** `v18+`
- **npm** or **yarn**
- A **MongoDB Atlas** cluster (free tier works)
- A **Pusher** account (free Sandbox tier works)

### 1 · Clone the Repository

```bash
git clone https://github.com/user-synax/tare-chat.git
cd tare-chat
```

### 2 · Install Dependencies

```bash
npm install
# or
yarn install
```

### 3 · Configure Environment Variables

Create a `.env.local` file at the root:

```env
# ─── MongoDB ───────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/tare-chat

# ─── Auth ──────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# ─── Pusher ────────────────────────────────────────────
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=ap2

NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap2

# ─── Socket.io ─────────────────────────────────────────
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 4 · Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live! 🎉

---

## 📁 Project Structure

```
tare-chat/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/             # Login / Register pages
│   ├── (chat)/             # Chat room pages
│   ├── api/                # API routes (REST + Socket handlers)
│   └── layout.jsx          # Root layout
│
├── components/             # shadcn/ui + custom components
│   ├── ui/                 # Base shadcn components
│   ├── chat/               # ChatWindow, MessageBubble, etc.
│   └── shared/             # Navbar, Sidebar, etc.
│
├── lib/                    # Utilities & configs
│   ├── db.js               # MongoDB connection
│   ├── auth.js             # JWT helpers
│   └── pusher.js           # Pusher server client
│
├── models/                 # Mongoose schemas
│   ├── User.js
│   ├── Room.js
│   └── Message.js
│
└── public/                 # Static assets
```

---

## 🌊 Architecture Overview

```
  Client (Browser)
       │
       ├──── HTTP ────────► Next.js API Routes ──── MongoDB Atlas
       │                          │
       └──── WebSocket ──► Socket.io Server
                    │
                    └──► Pusher Channels (broadcast)
                    │
                    └──► PeerJS (P2P / WebRTC)
```

1. **Auth flow** — credentials verified against MongoDB, JWT issued and stored in a secure cookie.
2. **Messaging flow** — message sent via HTTP → saved to MongoDB → broadcast to room via Socket.io + Pusher.
3. **Typing indicators** — ephemeral Socket.io events (never persisted).
4. **P2P** — PeerJS handles direct peer connections for lower-latency use cases.

---

## 🚢 Deployment

### Deploy to Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/user-synax/tare-chat)

1. Click the button above or import the repo from your Vercel dashboard.
2. Add all environment variables from `.env.local` to **Vercel → Project → Settings → Environment Variables**.
3. Deploy! Vercel auto-detects Next.js and handles everything else.

> ⚠️ **Note:** Socket.io on Vercel uses serverless functions — make sure your Pusher config is correctly set, as Vercel doesn't support persistent WebSocket connections natively.

---

## 🧑‍💻 Contributing

Contributions are always welcome! Here's how:

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open a Pull Request 🎉
```

Please follow the existing code style (JavaScript only, no TypeScript).

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) — The React framework for production
- [Socket.io](https://socket.io/) — Real-time bidirectional event-based communication
- [Pusher](https://pusher.com/) — Hosted WebSocket channels
- [PeerJS](https://peerjs.com/) — Simplified WebRTC
- [shadcn/ui](https://ui.shadcn.com/) — Beautifully designed components
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Cloud database

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:24243e,50:302b63,100:0f0c29&height=120&section=footer" width="100%"/>

**Built with 💜 by [Ayush](https://github.com/user-synax)**

⭐ If you found this useful, please consider giving it a star!

</div>
