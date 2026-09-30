# PrescriptionApp

Vanguard Clinical Desk is an outpatient workspace for a physician. It sits beside the hospital record: the doctor opens an assigned chart, sees the problems, allergies, current medicines, and recent labs, and writes today's prescription. Patients do not sign in.

## What the desk does

- Queue of open encounters assigned to the signed-in physician, with blood pressure and temperature
- Chart summary: problems, current medicines, and recent labs, plus vitals on the consult header
- **Continue** copies a current medicine onto today's slip with its recorded dose and frequency
- Symptom note with formulary suggestions after a short pause. In-stock medicines are listed before the rest
- Allergy hard stop. Amoxicillin and co-amoxiclav cannot be added or issued when the chart records a penicillin allergy. The reason names the reaction
- A medicine the patient already takes is not offered as a new course
- Adult formulary doses are refused for a patient under 18
- Possible causes, when the model answers, show a title and a rationale. They are not written into the diagnosis, and model links are not shown as citations
- If the model is unavailable, the desk says so and still lists formulary matches
- Printable slip with MRN, allergies, generic name, strength, frequency, and duration
- Prescription history with same-day revisions
- Standalone reception desk for registering an arrival and assigning a doctor. In hospital ERP mode that desk is hidden

## Demo charts

The seed is an English UAE general-medicine clinic, Al Noor Outpatient Clinic in Dubai. Re-seed after pulling this change. An existing database file is left as it is.

| Patient | What to show |
| --- | --- |
| Layla Al Hashimi | Fever and sore throat, penicillin rash, WBC 12.4. Azithromycin can be added. Amoxicillin is refused. |
| Fatima Al Mansoori | Diabetes review, HbA1c 7.8%, already on metformin and omeprazole. Continue both. |
| Omar Al Nuaimi | Hypertension follow-up, already on amlodipine |
| Hassan Al Maktoum | Adult allergic asthma, already on a salbutamol inhaler |
| Yusuf Rahman | Infected hand laceration, no drug allergy |

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Python, FastAPI, Pydantic, SQLite, MongoDB, JWT |
| Frontend | React 18, Parcel, Tailwind CSS |

SQLite holds users, the queue, the formulary, and issued prescriptions. MongoDB holds the disease history: problems, allergies, current medicines, labs, and visit notes. The API database file is `backend/data/prescription_app.db`.

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB on `localhost:27017`. `./start.sh` and `npm start` start it with Docker Compose when it is down. Without Docker, run `docker compose -f backend/docker-compose.yml up -d` yourself first.

### Quick start

```bash
./start.sh
```

Or:

```bash
npm start
```

Both free anything still listening on ports 9000 and 3001, install missing dependencies, start MongoDB if needed, seed the database when the SQLite file is missing, and start the API on port 9000 and the frontend on port 3001.

To load the UAE demo charts into an existing database, rebuild from `backend/`:

```bash
.venv/bin/python -m scripts.init_db
```

That deletes the SQLite file and the Mongo `disease_histories` collection, then seeds again.

### Manual setup

```bash
docker compose -f backend/docker-compose.yml up -d

cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m scripts.init_db
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 9000

cd ../frontend
npm install
npm run dev
```

### Access

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:9000/api |
| API health | http://localhost:9000/api/health |

### Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Physician | doctor@example.com | doctor123 |
| Reception | reception@example.com | doctor123 |

The login page fills these in. A physician lands on `/workspace`. Reception lands on `/reception` unless the API is in ERP mode.

## Configuration

`backend/.env` and `backend/.env.local` are loaded by the API. `JWT_SECRET` must be at least 32 bytes. `MONGODB_URI` defaults to `mongodb://localhost:27017`. `GEMINI_API_KEY` stays on the server. Without it, possible causes are marked unavailable and medicines still come from the formulary. The browser never calls the model directly. A suggestion call includes this patient's chart: date of birth, age, sex, weight, vitals, problems, allergies, current medicines, dated visits and their notes, labs, confirmed document facts, and recent slips. Name and MRN stay in the database.

`CLINIC_TIMEZONE` defaults to `Asia/Dubai` for same-day prescription revisions.

A single-origin tunnel, for a forwarded port, is `npm run start:tunnel`. It serves the Python API and the frontend through port 8080.

## API

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/auth/login | Sign in |
| GET | /api/auth/me | Current profile |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Physician

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/doctor/patients | Assigned open encounters |
| GET | /api/doctor/patients/:id | Chart, allergies, medicines, labs, open note |
| PUT | /api/doctor/encounters/:id | Save the visit note |
| POST | /api/doctor/encounters/:id/suggestions | Formulary matches and possible causes, using this patient's chart |
| GET | /api/doctor/formulary | Medication catalog |
| POST | /api/doctor/prescriptions | Issue a slip. Allergy and child-dose conflicts return 409 |
| GET | /api/doctor/prescriptions | History, three at a time |
| GET | /api/doctor/prescriptions/:id | One prescription for this physician, read by id |

### Reception

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/reception/doctors | Physicians who can be assigned |
| GET | /api/reception/arrivals | Today's arrivals |
| POST | /api/reception/arrivals | Register an arrival |

## Tests

```bash
cd backend && .venv/bin/python -m pytest tests/test_api.py
cd frontend && npm test
```

Frontend visual snapshots:

```bash
cd frontend && npm run test:visual
```
