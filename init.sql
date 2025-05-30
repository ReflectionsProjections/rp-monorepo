-- Drop existing schema if it exists
DROP SCHEMA IF EXISTS public CASCADE;

-- Create schema
CREATE SCHEMA public;
ALTER SCHEMA public OWNER TO pg_database_owner;
COMMENT ON SCHEMA public IS 'standard public schema';

-- Create Supabase roles
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role;
CREATE ROLE supabase_admin;
GRANT anon TO postgres;
GRANT authenticated TO postgres;
GRANT service_role TO postgres;
GRANT supabase_admin TO postgres;

-- Create types
CREATE TYPE public.committee_names AS ENUM (
    'CONTENT',
    'CORPORATE',
    'DESIGN',
    'DEV',
    'FULL TEAM',
    'MARKETING',
    'OPERATIONS'
);

CREATE TYPE public.event_type AS ENUM (
    'SPEAKER',
    'CORPORATE',
    'SPECIAL',
    'PARTNERS',
    'MEALS',
    'CHECKIN'
);

CREATE TYPE public.role_type AS ENUM (
    'USER',
    'STAFF',
    'ADMIN',
    'CORPORATE',
    'PUZZLEBANG'
);

CREATE TYPE public.staff_attendance_type AS ENUM (
    'PRESENT',
    'EXCUSED',
    'ABSENT'
);

-- Create tables
CREATE TABLE public.attendee_attendance (
    user_id character varying NOT NULL,
    events_attended uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    CONSTRAINT attendee_attendance_pkey PRIMARY KEY (user_id)
);

CREATE TABLE public.attendees (
    user_id character varying NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    has_priority_mon boolean DEFAULT false NOT NULL,
    has_priority_tue boolean DEFAULT false NOT NULL,
    has_priority_wed boolean DEFAULT false NOT NULL,
    has_priority_thu boolean DEFAULT false NOT NULL,
    has_priority_fri boolean DEFAULT false NOT NULL,
    has_priority_sat boolean DEFAULT false NOT NULL,
    has_priority_sun boolean DEFAULT false NOT NULL,
    has_redeemed_tshirt boolean DEFAULT false NOT NULL,
    has_redeemed_button boolean DEFAULT false NOT NULL,
    has_redeemed_tote boolean DEFAULT false NOT NULL,
    has_redeemed_cap boolean DEFAULT false NOT NULL,
    is_eligible_tshirt boolean DEFAULT true NOT NULL,
    is_eligible_button boolean DEFAULT false NOT NULL,
    is_eligible_tote boolean DEFAULT false NOT NULL,
    is_eligible_cap boolean DEFAULT false NOT NULL,
    favorite_events uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    puzzles_completed uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    CONSTRAINT attendees_pkey PRIMARY KEY (user_id)
);

CREATE TABLE public.corporate (
    email text NOT NULL,
    name text NOT NULL,
    CONSTRAINT corporate_pkey PRIMARY KEY (email)
);

CREATE TABLE public.event_attendance (
    event_id uuid NOT NULL,
    attendee character varying NOT NULL,
    CONSTRAINT event_attendance_pkey PRIMARY KEY (event_id, attendee)
);

CREATE TABLE public.events (
    event_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    points integer NOT NULL,
    description text NOT NULL,
    is_virtual boolean NOT NULL,
    image_url text,
    location text,
    is_visible boolean DEFAULT false NOT NULL,
    attendance_count integer DEFAULT 0 NOT NULL,
    event_type public.event_type NOT NULL,
    CONSTRAINT events_pkey PRIMARY KEY (event_id)
);

CREATE TABLE public.meetings (
    meeting_id uuid DEFAULT gen_random_uuid() NOT NULL,
    committee_type public.committee_names NOT NULL,
    start_time timestamp with time zone NOT NULL,
    CONSTRAINT meetings_pkey PRIMARY KEY (meeting_id)
);

CREATE TABLE public.notifications (
    user_id character varying NOT NULL,
    device_id text NOT NULL,
    CONSTRAINT notifications_pkey PRIMARY KEY (user_id)
);

CREATE TABLE public.registrations (
    user_id character varying NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    university text NOT NULL,
    graduation text,
    major text,
    dietary_restrictions text[] DEFAULT '{}'::text[] NOT NULL,
    allergies text[] DEFAULT '{}'::text[] NOT NULL,
    gender text,
    ethnicity text[] DEFAULT '{}'::text[],
    hear_about_rp text[] DEFAULT '{}'::text[],
    portfolios text[] DEFAULT '{}'::text[] NOT NULL,
    job_interest text[] DEFAULT '{}'::text[],
    is_interested_mech_mania boolean NOT NULL,
    is_interested_puzzle_bang boolean NOT NULL,
    has_resume boolean DEFAULT false NOT NULL,
    has_submitted boolean DEFAULT false NOT NULL,
    degree text NOT NULL,
    CONSTRAINT registrations_pkey PRIMARY KEY (user_id),
    CONSTRAINT registrations_email_key UNIQUE (email)
);

CREATE TABLE public.roles (
    user_id character varying NOT NULL,
    display_name text NOT NULL,
    email text NOT NULL,
    roles public.role_type[] DEFAULT '{}'::public.role_type[] NOT NULL,
    CONSTRAINT roles_pkey PRIMARY KEY (user_id),
    CONSTRAINT roles_email_key UNIQUE (email)
);

CREATE TABLE public.speakers (
    speaker_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    title text NOT NULL,
    bio text NOT NULL,
    event_title text NOT NULL,
    event_description text NOT NULL,
    img_url text NOT NULL,
    CONSTRAINT speakers_pkey PRIMARY KEY (speaker_id)
);

CREATE TABLE public.staff (
    email text NOT NULL,
    name text NOT NULL,
    team public.committee_names NOT NULL,
    attendances jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT staff_pkey PRIMARY KEY (email)
);

CREATE TABLE public.subscriptions (
    mailing_list text NOT NULL,
    subscriptions text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT subscriptions_pkey PRIMARY KEY (mailing_list)
);

-- Add foreign key constraints
ALTER TABLE ONLY public.attendee_attendance
    ADD CONSTRAINT attendee_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.roles(user_id);

ALTER TABLE ONLY public.attendees
    ADD CONSTRAINT attendees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.roles(user_id);

ALTER TABLE ONLY public.event_attendance
    ADD CONSTRAINT event_attendance_attendee_fkey FOREIGN KEY (attendee) REFERENCES public.attendees(user_id);

ALTER TABLE ONLY public.event_attendance
    ADD CONSTRAINT event_attendance_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.roles(user_id);

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.roles(user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON TABLE public.attendee_attendance TO anon;
GRANT ALL ON TABLE public.attendee_attendance TO authenticated;
GRANT ALL ON TABLE public.attendee_attendance TO service_role;

GRANT ALL ON TABLE public.attendees TO anon;
GRANT ALL ON TABLE public.attendees TO authenticated;
GRANT ALL ON TABLE public.attendees TO service_role;

GRANT ALL ON TABLE public.corporate TO anon;
GRANT ALL ON TABLE public.corporate TO authenticated;
GRANT ALL ON TABLE public.corporate TO service_role;

GRANT ALL ON TABLE public.event_attendance TO anon;
GRANT ALL ON TABLE public.event_attendance TO authenticated;
GRANT ALL ON TABLE public.event_attendance TO service_role;

GRANT ALL ON TABLE public.events TO anon;
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;

GRANT ALL ON TABLE public.meetings TO anon;
GRANT ALL ON TABLE public.meetings TO authenticated;
GRANT ALL ON TABLE public.meetings TO service_role;

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;

GRANT ALL ON TABLE public.registrations TO anon;
GRANT ALL ON TABLE public.registrations TO authenticated;
GRANT ALL ON TABLE public.registrations TO service_role;

GRANT ALL ON TABLE public.roles TO anon;
GRANT ALL ON TABLE public.roles TO authenticated;
GRANT ALL ON TABLE public.roles TO service_role;

GRANT ALL ON TABLE public.speakers TO anon;
GRANT ALL ON TABLE public.speakers TO authenticated;
GRANT ALL ON TABLE public.speakers TO service_role;

GRANT ALL ON TABLE public.staff TO anon;
GRANT ALL ON TABLE public.staff TO authenticated;
GRANT ALL ON TABLE public.staff TO service_role;

GRANT ALL ON TABLE public.subscriptions TO anon;
GRANT ALL ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.subscriptions TO service_role;

-- Set default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;
