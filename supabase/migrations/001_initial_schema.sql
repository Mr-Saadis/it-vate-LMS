-- ============================================================
-- IT-vate Solutions LMS — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS TABLE ─────────────────────────────────────────────
-- Mirrors Supabase Auth users with additional profile fields
CREATE TABLE IF NOT EXISTS public.users (
  user_id     UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  phone_number TEXT,
  education   TEXT,
  role        TEXT        NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── EXPERIENCES TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.experiences (
  experience_id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  experience      TEXT        NOT NULL,
  experience_dates TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── COURSES TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.courses (
  course_id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  slug        TEXT        NOT NULL UNIQUE
);

-- ─── LEVELS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.levels (
  level_id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id         UUID        NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
  no                SMALLINT    NOT NULL,
  level_title       TEXT        NOT NULL,
  level_description TEXT,
  price             NUMERIC(10,2) NOT NULL,
  code              TEXT,
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  started_at        TIMESTAMPTZ DEFAULT now(),
  ended_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── ENROLLMENTS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.enrollments (
  enroll_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  level_id        UUID        NOT NULL REFERENCES public.levels(level_id),
  track_type      TEXT        NOT NULL CHECK (track_type IN ('Expert', 'Progressive', 'Fast', 'Premium')),
  status          TEXT        NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Active', 'Completed', 'Rejected')),
  enroll_no       TEXT        UNIQUE,   -- e.g. CPDP202607001 (assigned on approval)
  enrolled_at     TIMESTAMPTZ DEFAULT now(),
  approved_at     TIMESTAMPTZ,
  rejected_reason TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── PAYMENTS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  payment_id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enroll_id             UUID        NOT NULL REFERENCES public.enrollments(enroll_id) ON DELETE CASCADE,
  amount                NUMERIC(10,2) NOT NULL,
  discount              NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount          NUMERIC(10,2) NOT NULL,
  payment_method        TEXT        NOT NULL DEFAULT 'Bank Transfer',
  transaction_reference TEXT        NOT NULL,
  status                TEXT        NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
  payment_proof         TEXT,         -- URL from Supabase Storage
  verified_by           UUID        REFERENCES public.users(user_id),
  verified_at           TIMESTAMPTZ,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ─── ENROLLED COURSES TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.enrolled_courses (
  enroll_id       UUID        NOT NULL REFERENCES public.enrollments(enroll_id) ON DELETE CASCADE,
  course_id       UUID        NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  PRIMARY KEY (enroll_id, course_id)
);

-- ─── PAYMENT COURSES TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_courses (
  payment_id      UUID        NOT NULL REFERENCES public.payments(payment_id) ON DELETE CASCADE,
  course_id       UUID        NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  PRIMARY KEY (payment_id, course_id)
);

-- ─── CONTENT ITEMS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_items (
  content_items_id UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id         UUID        NOT NULL REFERENCES public.levels(level_id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  content_type     TEXT        NOT NULL CHECK (content_type IN ('video', 'pdf', 'drive', 'link', 'code')),
  url              TEXT,
  drive_file_id    TEXT,
  youtube_id       TEXT,
  is_free          BOOLEAN     NOT NULL DEFAULT false,
  order_no         SMALLINT    NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrolled_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Users: can read and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin: full access to users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Experiences: own rows only
CREATE POLICY "Users manage own experiences"
  ON public.experiences FOR ALL USING (auth.uid() = user_id);

-- Courses: publicly readable when active
CREATE POLICY "Active courses are public"
  ON public.courses FOR SELECT USING (is_active = true);

-- Levels: publicly readable when course is active
CREATE POLICY "Levels are public"
  ON public.levels FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses WHERE course_id = levels.course_id AND is_active = true)
  );

-- Enrollments: students see own, admins see all
CREATE POLICY "Students see own enrollments"
  ON public.enrollments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins see all enrollments"
  ON public.enrollments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Students can insert own enrollment"
  ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update enrollments"
  ON public.enrollments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Payments: students see own, admins see all
CREATE POLICY "Students see own payments"
  ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE enroll_id = payments.enroll_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins see all payments"
  ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Students can insert payment"
  ON public.payments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.enrollments WHERE enroll_id = payments.enroll_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Content Items: accessible to enrolled students
CREATE POLICY "Enrolled students can view content"
  ON public.content_items FOR SELECT USING (
    is_free = true OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.level_id = content_items.level_id
        AND e.user_id = auth.uid()
        AND e.status = 'Active'
    )
  );

-- Enrolled Courses: students see own, admins see all
CREATE POLICY "Students see own enrolled_courses"
  ON public.enrolled_courses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins see all enrolled_courses"
  ON public.enrolled_courses FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Students can insert own enrolled_courses"
  ON public.enrolled_courses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment Courses: students see own, admins see all
CREATE POLICY "Students see own payment_courses"
  ON public.payment_courses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins see all payment_courses"
  ON public.payment_courses FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Students can insert own payment_courses"
  ON public.payment_courses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SUPABASE STORAGE BUCKET
-- Run this separately or via Supabase Dashboard:
-- Create a bucket named 'payment-proofs' with public access OFF
-- ============================================================

-- ============================================================
-- SEED DATA: Sample courses and levels (optional)
-- ============================================================

INSERT INTO public.courses (name, description, is_active, slug)
VALUES
  (
    'Embedded Systems & Firmware Engineering',
    'Master C/C++, ARM Cortex Microcontrollers, FreeRTOS, and Hardware Interfacing from bare-metal to OS level.',
    true,
    'embedded-systems-firmware'
  ),
  (
    'Industrial IoT & Edge Intelligence',
    'Build enterprise-grade IoT gateways, MQTT/HTTP protocols, ESP32/Linux edge nodes, and cloud connectivity.',
    true,
    'industrial-iot-edge-ai'
  ),
  (
    'PCB Design & High-Speed Hardware Design',
    'Comprehensive schematic creation, multi-layer layout, signal integrity, and manufacturing deliverables.',
    true,
    'pcb-design-hardware'
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert levels for Embedded Systems course
WITH emb AS (SELECT course_id FROM public.courses WHERE slug = 'embedded-systems-firmware')
INSERT INTO public.levels (course_id, no, level_title, level_description, price, code)
SELECT
  emb.course_id,
  lvl.no,
  lvl.title,
  lvl.description,
  lvl.price,
  lvl.code
FROM emb, (VALUES
  (1, 'Level 1: C/C++ Bare Metal Programming & GPIO', 'Registers, Memory Maps, Clocks, Interrupts', 150.00, 'EMB-L1'),
  (2, 'Level 2: Peripherals (I2C, SPI, UART, Timers, ADC)', 'Protocol drivers and sensor integration', 200.00, 'EMB-L2'),
  (3, 'Level 3: FreeRTOS & Real-Time OS Architecture', 'Mutexes, Semaphores, Queues & Task Scheduling', 250.00, 'EMB-L3')
) AS lvl(no, title, description, price, code)
ON CONFLICT DO NOTHING;
