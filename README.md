# University Results Management System

A full-stack university results management platform built to centralize academic results, transcript requests, complaints, announcements, and timetable access. The system provides role-specific dashboards for university administration, academic staff, and students, with a Django REST API powering a React frontend.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data and Synchronisation](#data-and-synchronisation)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Result Import Workflow](#result-import-workflow)
- [API Overview](#api-overview)
- [Security Notes](#security-notes)
- [Testing](#testing)
- [Known Setup Considerations](#known-setup-considerations)

## Overview

The University Results Management System is designed to support the academic results workflow across a university. Authorized staff can import marks, review results, and publish them when ready. Students can view published results, submit complaints about results, and request transcripts. Administrative and academic staff can manage academic structures and access department-level information.

The application also includes announcements, timetable management, user profiles, and signature uploads for transcript validation.

## Features

### Academic results
- Import student marks from CSV and Excel workbooks.
- Validate imported marks and report rows that cannot be processed.
- Create new result records or update existing records for the relevant exam component.
- Keep uploaded results unpublished until an authorized staff member publishes them.
- Allow students to view published results by semester.
- Display result remarks and GPA values derived from the system's grading rules.
- Retrieve class-level results and student rankings.

### Transcript workflow
- Allow students to submit transcript requests.
- Track transcript request statuses: `Pending`, `Validated`, and `Rejected`.
- Support validation workflows involving staff, Heads of Department (HODs), and directors.
- Store optional staff, HOD, and director signatures and validation notes.

### Result complaints
- Let students submit complaints about an exam result, provide a description of their concern, and optionally attach image evidence.
- Allow academic staff to review complaints and update their status.
- Track statuses including `Submitted`, `Under Review`, `Approved`, `Responded`, `Solved`, and `Rejected`.

### Academic administration and communication
- Organize schools, departments, degree/level structures, classes, courses, and course assignments.
- Provide dashboards and department-level performance statistics.
- Publish announcements targeted to a university, department, or class.
- Upload and view timetables.
- Manage user profiles, profile pictures, and authorized signatures.

### Authentication and access control
- Use JWT-based authentication through Django REST Framework Simple JWT.
- Provide frontend route protection and role-specific dashboards.
- Attach access tokens to API requests and attempt token refresh when a request returns `401 Unauthorized`.

## User Roles

The codebase distinguishes these user categories and responsibilities:

| Role | Main capabilities |
|---|---|
| Director / Admin | Manage school-level academic structures, access school-related information, publish university-wide announcements, and participate in transcript validation. |
| HOD | Access department information and results, review complaints, and participate in transcript validation. |
| Staff | Import and publish results for permitted department courses, review complaints, and participate in transcript validation. |
| Teacher | Access teacher-related academic information; additional privileges depend on whether the teacher is assigned HOD or staff responsibilities. |
| Student | View published results and courses, request transcripts, submit result complaints, and access relevant announcements and timetables. |

Actual access is enforced by backend permission classes and view logic. The role table is a functional summary, not a substitute for reviewing those checks.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript / JSX
- React Router
- Axios
- Styled Components and custom CSS

### Backend
- Python
- Django
- Django REST Framework
- Simple JWT
- Pandas for tabular result imports
- Pillow for image processing

### Databases
- SQLite for the application's default Django database.
- MySQL for the separate university database configured as `university_db`, which the synchronisation code reads from.

The exact installed package versions should be taken from the project's dependency manifests or the development environment. A backend `requirements.txt` was not present in the supplied project-file listing.

## Architecture

The application is divided into two main components:

1. **Frontend (`client/`)** — the React single-page application. It contains the login flow, protected routes, role-based dashboards, result views, transcript pages, complaints, announcements, and timetable interfaces.
2. **Backend (`backend/`)** — the Django application. It exposes REST endpoints, applies authentication and permission checks, manages the application's models, imports result files, and coordinates data synchronisation.

The backend uses two database connections:
- `default`: the local SQLite database (`backend/db.sqlite3`) for application-managed records.
- `university_db`: a MySQL connection to the existing university database. The synchronisation module fetches records from this database and maps them into the application's Django models.

## Project Structure

```text
System/
├── backend/
│   ├── academics/         # Courses, exams, results, complaints, transcripts
│   ├── announcements/     # Announcements and timetable-related functionality
│   ├── core/              # Django settings, URL configuration, ASGI/WSGI
│   ├── dashboards/        # Dashboard and statistics endpoints
│   ├── structure/         # Schools, departments, classes, degree structures
│   ├── synchronisation/   # Fetching, pairing, and synchronising university data
│   ├── user/              # User, student, teacher, staff, HOD, director models
│   ├── utils/             # Shared result-grading utilities
│   ├── media/             # Uploaded images, documents, evidence, signatures
│   ├── manage.py
│   └── db.sqlite3
├── client/
│   ├── src/
│   │   ├── components/    # Shared layout, UI, and protected routes
│   │   ├── context/       # Frontend synchronisation context
│   │   ├── page/          # Role-specific pages and shared pages
│   │   ├── services/      # API, authentication, and grading helpers
│   │   └── utils/         # Role-based route helpers
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Data and Synchronisation

The `synchronisation` app contains code for fetching records from the external university database, pairing users with their role records, checking teacher roles, and synchronising academic structures and related records.

The external database connection is configured through environment variables. It must be reachable and must contain the tables and columns expected by the synchronisation code. The database is separate from the application's SQLite database.

**Important:** Synchronisation should be tested against a development copy of the university database first. Review the synchronisation implementation and the target data before running it against real institutional records.

## Getting Started

### Prerequisites

Install the following before starting:

- Python compatible with the Django version used by the project.
- Node.js and npm.
- MySQL Server, with access to the expected university database, if synchronisation is required.
- Git, if cloning the repository.

### 1. Get the project

```bash
git clone <repository-url>
cd System
```

If you already have the source code locally, open a terminal in the project root.

### 2. Configure the backend environment

Create a Python virtual environment:

```bash
cd backend
python -m venv .venv
```

Activate it:

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```bat
.venv\Scripts\activate.bat
```

**Linux / macOS:**
```bash
source .venv/bin/activate
```

Install the backend dependencies. If the repository contains a maintained dependency file, use it:

```bash
pip install -r requirements.txt
```

If no `requirements.txt` is available, create one from the project's actual development environment or install and pin the dependencies required by the imports and Django settings. The codebase uses Django, Django REST Framework, Simple JWT, a MySQL driver, Pandas, and Pillow; Excel imports may also require an Excel engine such as `openpyxl`. Do not treat this list as a version-pinned lockfile.

### 3. Configure environment variables

Create a local `backend/.env` file. Use your own credentials and do not commit this file.

Example structure:

```dotenv
UNIV_DB_NAME=your_university_database
UNIV_DB_USER=your_mysql_username
UNIV_DB_PASSWORD=your_mysql_password
UNIV_DB_HOST=127.0.0.1
UNIV_DB_PORT=3306
```

These variables are used for the `university_db` MySQL connection. The default SQLite database does not require MySQL credentials.

Confirm that the database name, user permissions, host, port, and expected source tables match your local environment.

### 4. Prepare the backend database

From the `backend/` directory:

```bash
python manage.py check
python manage.py migrate
```

Create a local administrator account if needed:

```bash
python manage.py createsuperuser
```

The project includes a `db.sqlite3` file, but a new environment should not assume that a supplied development database contains valid or appropriate user data. Back up any database before replacing or migrating it.

### 5. Configure and install the frontend

Open a second terminal:

```bash
cd client
npm install
```

The current frontend API client points to:

```text
http://127.0.0.1:8000/api/
```

The login page also calls the same local backend origin directly. If your backend runs on a different host or port, update those API references consistently before starting the frontend.

## Environment Configuration

### Backend

The Django settings configure:
- SQLite as the default application database.
- MySQL as the `university_db` connection.
- JWT authentication for Django REST Framework.
- Local development CORS origins for Vite (`localhost:5173` and `localhost:5174`).
- Media files under `backend/media/`.

For deployment, move secrets into environment variables, configure `DEBUG`, set `ALLOWED_HOSTS`, define production CORS/CSRF origins, and use an appropriate production database and media-storage strategy.

### Frontend

The API base URL is currently hard-coded in `client/src/services/api.js` and in the login page. A production deployment should use a single environment-driven configuration rather than maintaining separate hard-coded URLs.

For example, a Vite environment variable could be used after updating the API client:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
```

Vite exposes variables prefixed with `VITE_` to browser code. Never place passwords, database credentials, or other server-side secrets in frontend environment variables.

## Running the Application

Start the backend from `backend/`:

```bash
python manage.py runserver
```

Start the frontend from `client/` in a separate terminal:

```bash
npm run dev
```

Open the local address printed by Vite, commonly `http://localhost:5173`.

The Django development server normally runs at `http://127.0.0.1:8000`. The Django admin interface is available at `/admin/` when an administrator account exists.

These commands are intended for local development, not production deployment.

## Result Import Workflow

The backend result-upload view accepts CSV and Excel formats (`.csv`, `.xlsx`, and `.xls`). The implementation expects a `student_name` column and a mark column that is normalised to `mark_obtained`. For Excel files, the code skips the first eight rows when reading the workbook, so the import template must match that expectation.

Example CSV:

```csv
student_name,mark_obtained
Student One,78
Student Two,91
Student Three,64
```

Before importing, confirm:
- The selected class/course and exam component are correct.
- Student names match the enrolled students' full names as represented in the system.
- Marks are numeric and within the accepted range of `0` to `100`.
- The file headers match the expected format.
- The user performing the upload has the required staff permissions and department access.

The import response reports how many results were created, updated, or skipped, with details for skipped rows. Imported results are initially unpublished. Authorized staff can publish or unpublish results for an exam component; students retrieve only published results.

**Grading rule in the current code:** remarks are calculated from the mark as a percentage of the exam component's maximum mark:

| Percentage | Remark |
|---:|---|
| 90–100% | Excellent |
| 80–<90% | Very Good |
| 70–<80% | Good |
| 60–<70% | Fairly Good |
| 50–<60% | Average |
| Below 50% | Weak |

The GPA helper maps those remarks to grade points. Confirm that these rules match the institution's official grading policy before using the system for official academic decisions.

## API Overview

The API is mounted under `/api/`. Main route groups include:

| Prefix | Purpose |
|---|---|
| `/api/user/` | Authentication, profiles, and user-related operations |
| `/api/structure/` | Schools, departments, degree structures, and classes |
| `/api/academic/` | Courses, exams, results, complaints, transcripts, and ranking |
| `/api/dashboard/` | Dashboard information and statistics |
| `/api/announcements/` | Announcements and timetables |
| `/api/sync/` | Data synchronisation operations |

Selected academic endpoints defined in the current URL configuration include:

- `GET /api/academic/class/<class_id>/course`
- `GET /api/academic/courses`
- `GET /api/academic/exams`
- `POST /api/academic/result/upload`
- `POST /api/academic/result/publish`
- `GET /api/academic/result/publish/status`
- `GET /api/academic/result/student/retrieve/<semester_num>`
- `GET /api/academic/result/staff/retrieve/<semester_num>/<class_id>`
- `GET /api/academic/result/student/ranking/<semester_num>/`
- `GET /api/academic/transcript/`
- `POST /api/academic/transcript/`
- `POST /api/academic/transcript/<transcript_id>/validate/`
- `/api/academic/complaints/` — complaint endpoints provided through a DRF router

Most endpoints require authentication. Exact methods, payload fields, permissions, and response formats should be confirmed in the corresponding view and serializer before integrating another client.

## Security Notes

- **Never commit `.env` files, passwords, tokens, private keys, or production data.**
- The supplied source bundle contains a backend environment file with a database password. If that credential is real or has ever been used, rotate it immediately, remove it from version control/history where applicable, and replace it with a new secret stored outside the repository.
- Do not publish `db.sqlite3` or uploaded media if they contain personal, academic, or otherwise confidential information.
- Use synthetic or anonymised student data for demonstrations and public repositories.
- Configure production `DEBUG`, `ALLOWED_HOSTS`, CORS, CSRF, HTTPS, database permissions, backups, and media access deliberately.
- Review role and object-level permissions before deployment. Authentication alone does not guarantee that a user is authorised to access every record.
- Use a production-grade deployment server rather than Django's development server.

## Testing

The project contains Django test modules in the individual apps. Run the backend test suite with:

```bash
python manage.py test
```

The frontend includes an ESLint configuration. Run the available frontend scripts with:

```bash
npm run
```

Then execute the lint/build scripts defined by `client/package.json`. Confirm that tests cover result imports, department-level permissions, publication status, complaint transitions, transcript validation, and synchronisation before treating the system as production-ready.

## Known Setup Considerations

- The supplied file listing does not include a backend `requirements.txt`; dependency versions should be captured from the working development environment.
- The frontend API URL is hard-coded to a local backend address in more than one file and should be centralised before deployment.
- The external MySQL database is required for synchronisation functionality, but not every local UI flow necessarily needs to trigger a synchronisation.
- The Excel importer skips the first eight rows. Use the matching template or adjust the importer deliberately.
- Student matching during result import uses full names. Duplicate names or inconsistent spelling can cause rows to be skipped or potentially matched incorrectly; stable student identifiers would be safer for a production workflow.
- The codebase contains test modules, but their presence does not by itself establish adequate test coverage or production readiness.

## Contributing

1. Create a branch for your change.
2. Keep frontend and backend changes aligned when modifying API contracts.
3. Add or update tests for business rules and permissions.
4. Never use real student records or secrets in commits, test fixtures, screenshots, or issue reports.
5. Document any changes to import templates, grading rules, roles, or synchronisation behaviour.
