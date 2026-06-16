# Gestetner — Printer Service Visit Manager

A mobile-first front-end application for managing printer service visits, built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Data is stored in local **JSON files** (acting as a lightweight database) and accessed exclusively through a centralized **API caller** (`lib/apiClient.ts`) that talks to Next.js API routes.

## Demo accounts

| Role        | Technician Code | Password   |
|-------------|------------------|------------|
| Manager     | `1111`           | `abc@0123` |
| Technician  | `0000`           | `abc@0123` |

Two additional technician accounts (`0001`, `0002`) are seeded for richer dashboard/report data.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll land on the shared login screen. Based on the technician code entered, you'll be routed to either the **Technician** (mobile-app style) experience or the **Manager** (desktop dashboard) experience.

## Project structure

```
app/
  page.tsx                  # Shared login screen
  api/                       # API routes (JSON "database" access layer)
    auth/login
    auth/reset-password
    visits
    visits/[id]
    machines
    machines/[ref]
    technicians
    technicians/[techCode]
    dashboard
    reports/overall
    reports/technician/[techCode]
  technician/                # Mobile-first technician portal
    layout.tsx               # Bottom nav + mobile shell
    home/
    site-visit/              # Primary feature — new site visit form
    history/
    history/[id]/
    machines/
    more/
    more/reset-password/
  manager/                   # Desktop manager portal
    layout.tsx               # Sidebar shell
    dashboard/                # Stats + charts
    technicians/              # Technician cards
    technicians/[techCode]/   # Technician profile + visit history
    reports/                  # Overall & technician-wise reports

components/
  Logo.tsx
  ui/                         # Button, Field (Input/Select/Textarea), Common (Card, Badge, etc.)

lib/
  apiClient.ts                # Centralized API caller used by every page
  db.ts                       # Server-side JSON file read/write helpers
  auth.tsx                    # Client-side auth context (localStorage session)
  export.ts                   # CSV & PDF export helpers
  types.ts                    # Shared TypeScript types

data/
  users.json                  # Managers & technicians (credentials, profile info)
  machines.json                # Printer/machine + customer records
  visits.json                  # Site visit records ("audit" data)
  categories.json              # Solution category options
```

## Data layer ("JSON database")

All persistent data lives under `/data` as JSON files:

- **`users.json`** — manager and technician accounts (technician code, password, name, contact info).
- **`machines.json`** — printer/machine inventory with linked customer details.
- **`visits.json`** — site visit audit records (technician, machine, category, note, meter reading, GPS coordinates, date/time, created timestamp).
- **`categories.json`** — the 11 solution category options used in the Site Visit form.

These files are read/written via `lib/db.ts` on the server. The **only** way the UI touches this data is through `lib/apiClient.ts`, which calls the Next.js API routes under `app/api/*`. This keeps a clean separation between frontend and "backend" — if you later swap the JSON files for a real database (SQL Server, etc.), only `lib/db.ts` needs to change.

## Technician Portal (mobile-first)

- **Bottom navigation**: Home, Site Visit, History, Machines, More.
- **Home**: greeting, quick stats (today / this week / all-time), quick-action card to start a new visit, and recent visits.
- **Site Visit** (primary feature): machine reference number, solution category (11 options), optional note, optional meter reading. On submit, the browser's Geolocation API captures GPS coordinates automatically and the record is saved with technician info, date/time, and location.
- **History**: card list of past visits with search, date-range filtering, visit detail view, and Excel/PDF export.
- **Machines**: search by reference number to view machine + customer details.
- **More**: profile summary, reset password, logout.

## Manager Portal (desktop)

- **Sidebar navigation**: Dashboard, Technicians, Reports.
- **Dashboard**: total visits, most-visited category, top technician, a 7-day line chart (total + top categories), and a category-distribution pie chart.
- **Technicians**: card grid of technicians with visit counts; click through to `/manager/technicians/[techCode]` for a full profile, stats, date-range filtering, and exports.
- **Reports**: tabbed **Overall Report** (all technicians, filterable/searchable) and **Technician-wise Report** (pick a technician + date range), both exportable to Excel (CSV) and PDF.

## Exports

`lib/export.ts` provides:
- `exportVisitsToCSV()` — generates an Excel-compatible CSV (UTF-8 BOM) for download.
- `exportVisitsToPDF()` — generates a formatted PDF table via `jspdf` + `jspdf-autotable`.

## Branding

The Gestetner logo is loaded from the company's website via `components/Logo.tsx`, and the brand red (`#E4002B`) is used as the primary accent color throughout (`app/globals.css`).

## Notes

- Authentication is a simple credential check against `users.json` with a client-side session stored in `localStorage`. This is suitable for a prototype/demo; a production system should use hashed passwords and JWT (per the original requirements doc) on a real backend.
- Visit IDs (`V00001`, `V00002`, ...) auto-increment based on existing records in `visits.json`.
