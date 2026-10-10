# MedFlow

MedFlow is a healthcare workflow demo built with Next.js and an Express API. It includes a role-based dashboard UI, prescription upload and verification endpoints, a Supabase storage layer, and optional AI-assisted medicine information.

> **Project status:** This repository is a demo/prototype. The dashboard login is client-side demo access, and the API routes do not currently enforce authentication or role-based authorization. Do not use real patient information or expose this deployment as a production healthcare system until proper authentication, authorization, privacy, and security controls are implemented and reviewed.

## Features

- Next.js dashboard UI with Admin, Doctor, and Patient demo views.
- Express API served by Vercel as a serverless function.
- Supabase Postgres persistence for users, appointments, availability, patient records, and prescriptions.
- Private Supabase Storage bucket for uploaded prescription files.
- Prescription verification endpoint and QR-related frontend helpers.
- Optional medicine analysis through the OpenAI API, with a local demo fallback when no key is configured.
- Local development with Next.js and the Express API running together.

Some dashboard sections are currently UI demos and save changes only in browser state; they are not all connected to the API yet.

## Tech stack

- Next.js 15, React 19, Tailwind CSS 4
- Express 5
- Supabase Postgres and Storage
- Optional OpenAI API
- Vercel deployment

## Requirements

- Node.js (use a current LTS release)
- npm
- A Supabase project for persistent database and file storage
- Optional: an OpenAI API key for AI-assisted medicine analysis

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root. Use the variables below. Keep `.env` private; it is ignored by Git.

   ```dotenv
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
   OPENAI_API_KEY=
   OPENAI_MODEL=gpt-5-mini
   NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
   ```

   `SUPABASE_SERVICE_ROLE_KEY` is a server-side secret. Never add a `NEXT_PUBLIC_` prefix to it, commit it, or share it in screenshots or chat. `OPENAI_API_KEY` is optional.

3. In Supabase, open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql). This creates the database tables and the private `prescription-files` Storage bucket.

4. Start Next.js and the API together:

   ```bash
   npm run dev:full
   ```

   Open [http://localhost:3000](http://localhost:3000). The API listens on port `4000` during local development, and Next.js rewrites `/api` requests to it.

Other useful commands:

```bash
npm run dev          # Next.js frontend only
npm run dev:server   # Express API only
npm run build        # Production build
npm start            # Start the Next.js production server
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `SUPABASE_URL` | For persistent storage | Supabase **Project URL**, found in the Supabase project API settings. |
| `SUPABASE_SERVICE_ROLE_KEY` | For persistent storage | Supabase server-side service role/secret key. Keep it private. |
| `OPENAI_API_KEY` | No | OpenAI API key for AI-assisted medicine analysis. Without it, the API returns a local demo analysis. |
| `OPENAI_MODEL` | No | OpenAI model name; defaults to `gpt-5-mini`. |
| `NEXT_PUBLIC_APP_BASE_URL` | No | Public frontend URL used when generating prescription links/QR codes. Set this to the deployed site URL in Vercel. |
| `NEXT_PUBLIC_API_BASE_URL` | Usually no | Set only when the frontend and API are deployed separately. Leave unset for this Vercel same-project setup. |
| `API_PORT` | No | Local Express port; defaults to `4000`. |
| `HOST` | No | Local Express bind host; defaults to `0.0.0.0`. |

Add Vercel environment variables under **Project Settings → Environments**. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to every environment you use (Production, Preview, and Development), then redeploy. Add `OPENAI_API_KEY` only if AI-assisted analysis is wanted.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql) once.
3. Find the Project URL and server-side service role/secret key in the project API settings.
4. Put those values in the local `.env` and the appropriate Vercel environments.
5. After deploying, check `/api/health`. A connected setup should report `connection.ok: true` and `storage.provider: "supabase"`.

If the Supabase variables are missing, the current storage module falls back to in-memory demo storage. Data written in that mode is temporary and can disappear when the serverless function restarts.

## Deploy to Vercel

1. Push this repository to GitHub and import it into Vercel.
2. Use the repository root as the **Root Directory** (unless the repository is nested differently in your Vercel import).
3. Keep the default Next.js framework/build settings.
4. Add the environment variables described above to the environments you plan to use.
5. Deploy or redeploy after changing environment variables.
6. Visit the deployment URL and `/api/health` to check the API and storage connection.

If Vercel Deployment Protection is enabled, unauthenticated visitors and external health checks may be redirected to Vercel SSO. Review **Project Settings → Deployment Protection** if the site is meant to be publicly accessible. Do not disable protection as a substitute for application-level authentication.

## API routes

All routes below are mounted under `/api`.

| Method and path | Purpose |
| --- | --- |
| `GET /api/health` | API and storage connection status. |
| `GET /api/demo-users` | Ensures and returns demo users. |
| `POST /api/login` | Demo email lookup; this is not production authentication. |
| `GET /api/users` | List users; optional `?role=doctor` filter. |
| `POST /api/users` | Create a user. |
| `PATCH /api/users/:id` | Update a user. |
| `DELETE /api/users/:id` | Delete a user. |
| `GET /api/appointments` | List appointments; optional `doctorId` or `patientId` filter. |
| `POST /api/appointments` | Create an appointment. |
| `PATCH /api/appointments/:id` | Update appointment fields. |
| `PATCH /api/appointments/:id/status` | Update appointment status. |
| `DELETE /api/appointments/:id` | Delete an appointment. |
| `GET /api/availability` | List doctor availability; optional `doctorId` filter. |
| `POST /api/availability` | Add an availability slot. |
| `DELETE /api/availability/:id` | Delete an availability slot. |
| `GET /api/patients/:id/profile` | Read a patient profile. |
| `PATCH /api/patients/:id/profile` | Update a patient profile. |
| `GET /api/patients/:id/records` | Read a patient's records. |
| `POST /api/patients/:id/records` | Add a patient record. |
| `PATCH /api/patients/:patientId/records/:id` | Update a patient record. |
| `DELETE /api/patients/:patientId/records/:id` | Delete a patient record. |
| `GET /api/analytics` | Return basic user and appointment counts. |
| `POST /api/prescriptions/upload` | Upload prescription details and an optional PDF/JPG/PNG/WEBP file as multipart form data. Maximum file size: 10 MB. |
| `GET /api/prescriptions` | List saved prescriptions. |
| `GET /api/prescriptions/:prescriptionId/verify` | Verify a prescription and return its details. |
| `POST /api/medicines/analyze` | Analyze a JSON body containing a `medicines` string array. |

Example medicine analysis request:

```json
{
  "medicines": ["warfarin", "ibuprofen", "metformin"]
}
```

Medicine analysis is informational only. It is not medical advice and must not replace a qualified clinician or pharmacist.

## Data and security notes

- The Supabase service role key has broad database privileges. Keep it server-side and protect it as a secret.
- API endpoints currently lack authentication and role-based authorization. Anyone who can reach an unprotected deployment may be able to call data routes directly.
- The UI's role selection is demo-only; selecting a role is not a secure sign-in.
- Configure Supabase Row Level Security and appropriate policies when moving to a client-accessible data model. Never expose the service role key in browser code.
- Before handling real patient data, implement and review authentication, authorization, audit logging, privacy controls, and applicable regulatory requirements.
- Medicine analysis output can be incomplete or wrong. Confirm medication decisions with a qualified professional.

## Repository map

```text
app/                 Next.js pages, dashboard UI, styles, and frontend helpers
api/index.js         Vercel serverless entry point for the Express API
server/              Express routes and Supabase storage/data access
supabase/schema.sql  Database tables, indexes, and private storage bucket setup
contracts/           Solidity contract files and notes
```

## License

No license file is currently included. Contact the project owner before reusing or redistributing this code.
