# Onboardly: employee onboarding platform (MERN)

HR adds a new hire, a 12-task onboarding checklist is scheduled from their start date, managers track progress, and employees work through their own path.

## Features

- **JWT authentication** with three roles: HR, manager and employee
- **Role-based access**: HR sees everyone, managers see their own team, employees see only themselves (enforced on the API, not just the UI)
- **Auto-generated checklist** with due dates calculated from the start date (day 0 to day 90)
- **Onboarding path**: a four-milestone view (first day, week, month, 90 days) with live progress
- **Task management**: create, edit, delete, assign, filter by status and person, search, overdue detection
- **Dashboards**: personal progress ring for employees; team stats, overdue list and progress per person for HR and managers
- Responsive layout, keyboard-visible focus, reduced-motion support

## Tech stack

| Layer | Tools |
|---|---|
| Database | MongoDB, Mongoose |
| API | Node.js, Express, JWT, bcryptjs, helmet |
| Client | React 18, React Router, Axios, Vite, Lucide icons |

## Project structure

```
onboardly/
├── server/
│   ├── config/db.js
│   ├── controllers/      auth, users, tasks, stats
│   ├── middleware/       auth (protect / authorize), error handling
│   ├── models/           User, Task
│   ├── routes/
│   ├── utils/            default checklist, role scoping, progress aggregation
│   ├── seed.js           demo data
│   └── server.js
└── client/
    └── src/
        ├── components/   Layout, Journey, ProgressRing, TaskRow, modals…
        ├── context/      Auth, Toast
        ├── pages/        Login, Dashboard, Tasks, Employees, EmployeeDetail
        └── styles.css
```

## Run it locally

You need Node 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

```bash
npm run install-all
cp server/.env.example server/.env     # then edit MONGO_URI and JWT_SECRET
npm run seed                           # loads demo users and tasks
npm run dev                            # API on :5000, client on :5173
```

Open http://localhost:5173 and sign in with a demo account (password `password123`):

| Role | Email |
|---|---|
| HR | hr@onboardly.com |
| Manager | manager@onboardly.com |
| Employee | aria@onboardly.com |

## API overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | signed in |
| GET | `/api/users` | HR (all), manager (team) |
| POST | `/api/users` | HR. Creates the user and their checklist |
| GET / PUT / DELETE | `/api/users/:id` | HR (write); HR and the person's manager (read) |
| GET | `/api/tasks?assignee=&status=` | scoped by role |
| POST | `/api/tasks` | HR, manager |
| PATCH | `/api/tasks/:id` | employees: status only; HR and managers: all fields |
| DELETE | `/api/tasks/:id` | HR, manager |
| GET | `/api/stats` | scoped by role |

## Deploy

**Database:** create a free cluster on MongoDB Atlas, add a database user, allow network access, and copy the connection string.

**App (single service on Render):**

1. Push this folder to GitHub.
2. In Render, choose New > Blueprint and select the repo. `render.yaml` sets up the build.
3. Set `MONGO_URI` to your Atlas string. `JWT_SECRET` is generated for you.
4. After the first deploy, run the seed once from the Render shell: `npm run seed`.

In production Express serves the built React app, so there is no CORS setup and one URL to share.

**Split hosting (optional):** deploy `client/` to Vercel or Netlify with `VITE_API_URL=https://your-api/api`, and set `CLIENT_URL` on the API to the client's address.

## Ideas to extend it

- Edit-employee form (the `PUT /api/users/:id` endpoint already exists)
- Email reminders for tasks due soon (node-cron + Nodemailer)
- Document uploads for paperwork tasks
- Custom checklist templates per department
