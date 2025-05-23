# Patient Registration Website

This is a frontend-only Patient Registration app built using **React** and **Pglite** (a WebAssembly version of SQLite) for client-side data persistence. The app allows users to:

* Register new patients
* Query patient records using raw SQL
* Maintain persistent data across page reloads
* Sync updates across multiple tabs in real-time

---

## Features

* **Pglite for Storage**
  All data is stored directly in the browser using SQLite via Pglite (WebAssembly).
* **BroadcastChannel API**
  Ensures updates made in one tab reflect in all open tabs seamlessly.
* **Live SQL Query Panel**
  Run raw SQL queries on the client-side to explore patient data.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/akshaynair5/medblocks-task-round.git

```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the App Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Implementation Overview

* **Frontend Framework**: React (with Vite)
* **Database**: Pglite for in-browser SQLite-like storage
* **Tab Sync**: `BroadcastChannel` to synchronize data across tabs
* **Persistence**: IndexedDB (via Pglite) keeps data across page reloads

---

## Notes

* Make sure your browser supports **WebAssembly** and the **BroadcastChannel API**.
* All data is stored **locally** in the browser; there's no backend.

---

## 🔗 Live Demo

[**Click here to view the app live**](https://medblocks-task-round.vercel.app/)

---
