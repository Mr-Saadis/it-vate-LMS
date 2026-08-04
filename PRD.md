# Product Requirements Document (PRD)
**Project Name:** IT-vate Solutions Platform (Portfolio + LMS)
**Stack:** Next.js (App Router), Supabase (PostgreSQL, Auth, Storage), Tailwind CSS, Shadcn UI.
**Target Audience:** Prospective clients (Portfolio) and Enrolled Students/Admin (LMS).

---

## 1. Project Overview
IT-vate Solutions requires a unified web platform divided into two logical domains served from a single Next.js monorepo:
1. **Public Portfolio (`itvatesolutions.com`):** A static marketing site highlighting services, and a course browsing catalog.
2. **LMS Dashboard (`lms.itvatesolutions.com`):** A secure, authenticated portal for students to track course progress, and an admin panel for enrollment verification.

---

## 2. UI/UX & Design Guidelines
The design must be strictly professional, engineering-centric, and clean. 
* **Color Palette:** 
  * Backgrounds/Surfaces: **White** (clean, minimal). 
  * Primary Text/Nav/Footer/Headings: **Dull Navy Blue** (trust, corporate). 
  * Accents/CTAs: **Orange** (buttons, active states). "#F18231"
* **Typography & Components:** Use Shadcn UI (Inter/Geist font).
* **Aesthetics:** Minimal carding (avoid heavy drop shadows). Use clean grid layouts with generous whitespace and light borders (`border-slate-200`). No overlapping elements.
* **Iconography:** Strictly use **Lucide Icons** (Shadcn default). **NO EMOJIS.**

---

## 3. Application Architecture
Use Next.js App Router with Route Groups and Middleware to handle multiple domains.
* `src/app/(portfolio)`: Contains public pages (Home, About, Course Catalog).
* `src/app/(lms)`: Contains authenticated pages (Student Dashboard, Admin Panel).
* **Middleware (`middleware.ts`):** Must route traffic based on the hostname. Ensure Supabase Auth cookies are accessible across subdomains to prevent re-login.

---

## 4. Database Schema Reference
The system utilizes Supabase. Key tables include:
* **User:** `user_id`, `email`, `name`, `role` (admin/student), `education`, `year`.
* **Experience:** `experience_id`, `user_id` (FK), `experience` (text), `experience_dates`. (Users can have multiple experiences).
* **Course:** `course_id`, `name`, `description`, `is_active`, `slug`.
* **Level:** `level_id`, `course_id` (FK), `price`, `no` (level number), `title`.
* **Payment:** `payment_id`, `user_id` (FK), `amount`, `discount`, `total_amount`, `status` (Pending/Verified), `payment_proof` (URL from Supabase Storage).
* **Enrollment:** `enroll_id`, `user_id` (FK), `level_id` (FK), `status`, `enroll_no` (e.g., CPDP202607001).
* **Payment Enrollments:** `payment_id` (FK), `enroll_id` (FK) (Junction table linking payments to multiple enrollments).
* *(AI Note: Refer to standard relational practices for linking `Content_Items` as per typical LMS structures).*

---

## 5. Core Workflows

### A. Course Selection & Track System
When a user selects a course from the portfolio, they must choose one of four tracks (use Shadcn `RadioGroup` with orange active state borders):
1. **Expert Track:** All levels included.
2. **Progressive Track:** Sequential unlocking (Level 1, then 2...).
3. **Fast Track:** Custom selection of non-sequential levels.
4. **Premium Track:** 1-on-1 personalized training.
*Action:* Display dynamic pricing, discounts, and coupons based on the selected track.

### B. Authentication & Onboarding
* If unauthenticated on checkout: Redirect to a custom signup flow.
* **Signup Fields:** Name, Email, Password, Phone Number, Education, Role, and a dynamic field to add **Multiple Experiences** (maps to `Experience` table).
* Upon successful auth, seamlessly redirect to the Payment stage.

### C. Manual Payment Workflow
* Display company bank account details.
* User inputs transaction reference and uploads a screenshot of the payment proof.
* System creates a `Payment` record with status `Pending` and redirects the user to a "Waiting for Confirmation" page.

### D. Admin Verification & ID Generation
* Admin reviews `Pending` payments in the dashboard.
* Upon "Approve" action:
  1. Change payment status to `Verified`.
  2. Generate a permanent `enroll_no` format: `CPDP[YYYY][MM][Sequential_Number]`.
  3. Admin manually adds the student to Google Classroom (external action).

### E. Student LMS Dashboard
* **Main Area:** View enrolled tracks. Display progress bars for completed levels. Clicking a course shows detailed descriptions and links.
* **Sidebar (Dull Navy Blue background):**
  * Dashboard Main
  * Certificates (View/Download completed level certificates)
  * Discover Courses (Cross-selling internal page)

---

## 6. Step-by-Step Implementation Roadmap

**Phase 1: Initial Setup & Configuration**
1. Initialize Next.js App Router project with Tailwind CSS.
2. Install and configure Shadcn UI. Apply the White/Dull Navy Blue/Orange custom color variables in `globals.css`.
3. Set up Supabase client (`@supabase/supabase-js` and `@supabase/ssr`).

**Phase 2: Routing Architecture**
1. Create `(portfolio)` and `(lms)` route groups.
2. Implement `middleware.ts` to handle host-based routing between domains/subdomains and protect `(lms)` routes via Supabase Auth session checks.

**Phase 3: Database & Auth Integration**
1. Create Supabase tables strictly following the Schema Reference (Section 4).
2. Build custom Signup and Login pages using Shadcn `Form` components. Implement the "Multiple Experiences" dynamic form field.

**Phase 4: Public Portfolio Development**
1. Build static pages: Home, About, Services, Sustainability.
2. Build the Course Catalog page fetching active courses from Supabase.
3. Build the individual Course Detail page featuring the 4-Track selection UI.

**Phase 5: Checkout & Payment Flow**
1. Build the Checkout page summarizing the selected track/price.
2. Build the Payment Details form (transaction reference text input + file upload for payment proof via Supabase Storage).
3. Implement submission logic to insert `Pending` status in the DB.

**Phase 6: Admin Dashboard Development**
1. Create a secure Admin layout.
2. Build the Pending Payments data table (using Shadcn `Table`).
3. Implement the Approval Server Action: generate the `CPDP...` ID, update DB status, and grant LMS access.

**Phase 7: Student LMS Dashboard Development**
1. Create the Student layout with the Sidebar (Dashboard, Certificates, Discover).
2. Fetch and render enrolled courses with progress indicators.
3. Finalize UI polish ensuring strict adherence to the minimal carding, no-overlap rule.