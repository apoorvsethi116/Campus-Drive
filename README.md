# CampusDrive AI

A campus placement and recruitment management platform connecting **Students**, **Training & Placement Officers (TPOs)**, and **Recruiters** through a single system with an automated eligibility engine at its core.

## What it does

- TPOs create placement drives with configurable eligibility criteria (minimum CGPA, maximum backlogs, allowed branches, minimum 10th/12th percentages).
- The system automatically evaluates every student against every drive's criteria - no manual eligibility screening.
- Students browse drives, see exactly why they are or aren't eligible, and apply to the ones they qualify for.
- Recruiters review candidates for drives they've been assigned to and move applications through a fixed pipeline: `APPLIED -> SHORTLISTED -> OA_CLEARED -> INTERVIEW -> OFFERED` (or `REJECTED`/`WITHDRAWN` at any non-terminal stage).

## Key features

**Student**: register/login, dashboard with placement readiness summary, browse and search drives, explainable eligibility (see exactly which criteria you meet or miss), apply, track application status, withdraw an application, edit profile.

**TPO**: dashboard with placement statistics, full drive CRUD, assign recruiters to a drive, search/filter students by branch/CGPA/backlogs, view eligible vs. ineligible students for any drive with reasons.

**Recruiter**: dashboard scoped to assigned drives only, view/search/filter candidates per drive, view full candidate profiles, update application status (with fixed transition rules), add recruiter notes.

### Product differentiators

- **Explainable Eligibility** - every eligibility decision shows a full per-criterion breakdown (pass/fail for CGPA, backlogs, branch, 10th%, 12th%), not just a pass/fail flag.
- **Placement Readiness Summary** - a student's dashboard shows "Eligible for X / Y active drives" plus the most common reasons blocking eligibility elsewhere, aggregated from real data.
- **Dynamic Eligibility** - eligibility is never stored. It's recalculated live from the current student profile and current drive criteria on every request, so it's always correct even if either changes.

## Tech stack

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT (HTTP-only cookie), bcrypt, express-validator.
**Frontend**: React, Vite, Tailwind CSS, React Router, Axios, lucide-react.
**State management**: React Context (auth only) + local component state. No Redux or other global state library.

## Folder structure

```
CampusDrive-AI/
|-- backend/
|   `-- src/
|       |-- config/        # env validation, DB connection
|       |-- models/        # Mongoose schemas (User, StudentProfile, PlacementDrive, Application)
|       |-- controllers/   # thin HTTP handlers, grouped by role (auth, student, tpo, recruiter)
|       |-- services/      # business logic (eligibility, application workflow, auth)
|       |-- middleware/    # auth, RBAC, validation, centralized error handling
|       |-- routes/        # one router per role, aggregated in routes/index.js
|       |-- validators/    # express-validator rule sets
|       |-- utils/         # AppError, asyncHandler, apiResponse
|       `-- seed/          # demo data seed script
`-- frontend/
    `-- src/
        |-- components/    # common/ (shared UI), layout/, and one folder per role
        |-- pages/         # one folder per role, plus auth/
        |-- services/      # one Axios-based service module per role/domain
        |-- context/       # AuthContext (the only global state)
        |-- hooks/         # useAuth, useDebounce
        `-- utils/         # constants, validators, formatters
```

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local or Atlas)

## Installation

```bash
git clone <repo-url>
cd CampusDrive-AI

cd backend && npm install
cd ../frontend && npm install
```

## Environment variables

**backend/.env** (copy from `backend/.env.example`):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campusdrive
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**frontend/.env** (copy from `frontend/.env.example`):
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Database seeding

```bash
cd backend
npm run seed
```

This **clears and recreates** `User`, `StudentProfile`, `PlacementDrive`, and `Application` collections in whatever database `MONGO_URI` points to - don't run it against a database you care about. It prints demo credentials on completion.

## Running the app

```bash
# terminal 1
cd backend
npm run dev        # http://localhost:5000

# terminal 2
cd frontend
npm run dev         # http://localhost:5173
```

## Demo credentials

All demo accounts share the password: **`Demo@1234`**

| Role | Email | Notes |
|---|---|---|
| TPO | `tpo@campusdrive.test` | |
| Recruiter | `recruiter1@campusdrive.test` | assigned to TechNova, OrbitalWorks |
| Recruiter | `recruiter2@campusdrive.test` | assigned to FinEdge, Quantix |
| Student | `aarav.student@campusdrive.test` | clearly eligible for TechNova |
| Student | `ishita.student@campusdrive.test` | CGPA below requirement |
| Student | `karan.student@campusdrive.test` | too many backlogs |
| Student | `meera.student@campusdrive.test` | branch not eligible for tech drives |
| Student | `rohan.student@campusdrive.test` | fails multiple criteria |
| Student | `vikram.student@campusdrive.test` | borderline: exact minimum CGPA |

## API / role architecture

All endpoints are under `/api`. Every protected route requires a valid JWT (sent as an HTTP-only cookie) via `authenticate` middleware, then a specific role via `authorizeRoles(...)`.

- `/api/auth/*` - register, login, logout, me (public + self)
- `/api/student/*` - requires role `STUDENT`
- `/api/tpo/*` - requires role `TPO`
- `/api/recruiter/*` - requires role `RECRUITER`

Every response follows `{ success, message, data }` on success or `{ success: false, message, errors? }` on failure.

## Important architectural decisions

- **Eligibility is computed, never stored.** A single function, `checkEligibility(studentProfile, eligibilityCriteria)`, is the only place eligibility logic exists. It's called by student drive listings, drive details, application submission, and the TPO's eligible-students report - all four always agree, by construction.
- **Recruiter access is scoped via `PlacementDrive.recruiters[]`.** A recruiter can only see/act on drives where their user ID appears in that array; this is enforced server-side on every request, not just hidden client-side.
- **Duplicate applications are prevented by a MongoDB unique compound index** on `(student, drive)`, not application-level checking - the database itself is the guard.
- **Application status transitions are a plain JavaScript object** (`ALLOWED_TRANSITIONS`), checked with `.includes()`. No state-machine library.
- **No Mongoose transactions.** Every write in this system is a single atomic operation; nothing here coordinates multiple writes that need all-or-nothing semantics.
- **State management is Context (auth only) + local state.** No Redux/Zustand - deliberately, to keep the frontend simple enough to explain end-to-end in an interview.
