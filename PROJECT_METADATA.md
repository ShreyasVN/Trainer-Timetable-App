# Project Metadata & Assets

> Aggregate reference document for Trainer Timetable Application

## Badges (Placeholders)

| Status | Badge |
| ------ | ----- |
| Build  | `![Build Status](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)` |
| License| `![License](https://img.shields.io/github/license/<owner>/<repo>)` |
| Node   | `![Node Version](https://img.shields.io/badge/node-%3E=14-blue)` |

*(Replace `<owner>`/`<repo>` with your GitHub organization & repository names when ready)*

---

## Workspace Structure

```
D:\Trainer-Timetable-App
├── package.json                # Root meta & cross-workspace scripts
├── server/                     # Express & MySQL backend
│   ├── package.json
│   ├── .env.test
│   └── db/
│       └── schema.sql          # Authoritative DB schema
├── client/                     # React (CRA) frontend
│   ├── package.json
│   ├── .env.example
│   └── public/
│       ├── logo192.png
│       ├── logo512.png
│       └── …
└── client/react-project/       # Alternative Vite/React workspace
    └── package.json
```

---

## Package Manifests

### Root – `package.json`
* **name:** `trainer-timetable-app`
* **version:** `1.0.0`
* Key scripts: `dev`, `check-env`, `server`, `client`, `build`, `test`
* Core deps: `axios`, `bcrypt`, `dotenv`, `jsonwebtoken`, `mysql2`, etc.

### Server – `server/package.json`
* **name:** `server`
* **version:** `1.0.0`
* Main file: `index.js`
* Dev script: `nodemon index.js`
* Dev deps: `jest`, `supertest`, `eslint`

### Client – `client/package.json`
* **name:** `client`
* **version:** `0.1.0`
* React-scripts app served on `3001`
* TailwindCSS, FullCalendar, Chart.js, etc.

### Client (Vite) – `client/react-project/package.json`
* **name:** `react-project`
* **version:** `0.0.0`
* Uses Vite + React 19 + TypeScript

---

## Environment Configuration

Environmental documentation lives in **`ENVIRONMENT_SETUP.md`** and sample files:

| File | Purpose |
| ---- | ------- |
| `.env.sample` | Single master sample – copy into server & client env files |
| `server/.env.test` | Test-only overrides |
| `client/.env.example` | CRA sample |

Important variables (see doc for complete list):

```
PORT               # 5000 (server) / 3001 (client)
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
JWT_SECRET         # secure token signing secret
REACT_APP_API_URL  # Client -> API base URL
```

Run `npm run check-env` for pre-flight validation.

---

## Database Schema (excerpt)

`server/db/schema.sql` creates the following primary tables:

* `member` – user accounts (admin, trainer)
* `sessions` – training sessions schedule
* `busy_slots` – trainer unavailable blocks
* `notifications` – system notifications
* `course_category` – optional category lookup
* `trainer_utilization` – analytics metrics

All foreign keys cascade on delete; timestamps auto-maintained.

---

## Media Placeholders

No application screenshots or GIFs are committed yet. Allocate as follows:

```
docs/images/
├── dashboard.png        # Main dashboard screenshot
├── calendar.gif         # Booking drag-n-drop demo
└── mobile-view.png      # Responsive mobile layout
```

Embed in docs using markdown:

```md
![Dashboard](docs/images/dashboard.png)
```

---

## License

No `LICENSE` file was found in the repository. Add one to clarify usage. Popular choices:

* MIT – Open source, permissive
* GPL-3.0 – Copyleft
* Apache-2.0 – Corporate-friendly permissive

Once added, update the badge URL in the header.

---

## Next Steps

1. Commit a proper `LICENSE` file.
2. Replace badge placeholders with real URLs.
3. Capture screenshots/GIFs and place into `docs/images/`.
4. Automate CI and badge generation.

