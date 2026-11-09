create table public.student_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) between 0 and 100),
  phone text null check (phone is null or char_length(phone) <= 32)
);

alter table public.student_profiles enable row level security;

create policy "Candidates can read their own profile"
  on public.student_profiles for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student'
  );

create policy "Candidates can create their own profile"
  on public.student_profiles for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student'
  );

create policy "Candidates can update their own profile"
  on public.student_profiles for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student'
  )
  with check (
    (select auth.uid()) = user_id
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student'
  );

create table public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  reference text not null,
  program text not null,
  institution text not null,
  submitted_at timestamptz not null,
  status text not null,
  deadline timestamptz null,
  constraint student_enrollments_student_reference_unique unique (student_id, reference)
);

create index student_enrollments_student_submitted_idx
  on public.student_enrollments (student_id, submitted_at desc);

alter table public.student_enrollments enable row level security;

create policy "Candidates can read their own enrollments"
  on public.student_enrollments for select
  to authenticated
  using (
    (select auth.uid()) = student_id
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student'
  );

alter table public.student_enrollments
  add column if not exists terms text null,
  add column if not exists candidate_decision text null check (candidate_decision in ('confirmed', 'rejected')),
  add column if not exists candidate_decision_at timestamptz null,
  add column if not exists candidate_rejection_reason text null;

create or replace function public.decide_student_enrollment(
  p_enrollment_id uuid,
  p_decision text,
  p_rejection_reason text default null
)
returns public.student_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  enrollment public.student_enrollments;
  normalized_status text;
  next_status text;
begin
  if ((select auth.jwt()) -> 'app_metadata' ->> 'role') <> 'student' then
    raise exception 'candidate role required';
  end;

  select * into enrollment
  from public.student_enrollments
  where id = p_enrollment_id;

  if not found then
    raise exception 'enrollment not found';
  end;
  if enrollment.student_id <> (select auth.uid()) then
    raise exception 'enrollment does not belong to candidate';
  end;

  normalized_status := lower(regexp_replace(coalesce(enrollment.status, ''), '[ _-]+', ' ', 'g'));
  if normalized_status <> 'awaiting candidate'
     and normalized_status <> 'awaiting confirmation' then
    raise exception 'candidate decision cannot be recorded because the enrollment status already changed or no decision is permitted';
  end;

  if p_decision not in ('confirm', 'reject') then
    raise exception 'invalid candidate decision';
  end;
  if p_rejection_reason is not null and char_length(p_rejection_reason) > 500 then
    raise exception 'rejection reason is too long';
  end;

  next_status := case when p_decision = 'confirm' then 'candidate_confirmed' else 'candidate_rejected' end;

  update public.student_enrollments
  set status = next_status,
      candidate_decision = case when p_decision = 'confirm' then 'confirmed' else 'rejected' end,
      candidate_decision_at = timezone('utc', now()),
      candidate_rejection_reason = case when p_decision = 'reject' then nullif(btrim(p_rejection_reason), '') else null end
  where id = enrollment.id
    and lower(regexp_replace(coalesce(status, ''), '[ _-]+', ' ', 'g')) in ('awaiting candidate', 'awaiting confirmation')
  returning * into enrollment;

  if not found then
    raise exception 'candidate decision already been recorded';
  end;

  insert into public.student_activity
    (student_id, event_type, description, status_from, status_to, actor_id, actor_label)
  values
    (enrollment.student_id, 'enrollment_decision', enrollment.reference || ' enrollment decision', normalized_status, enrollment.status,
     (select auth.uid()), 'Candidate');

  return enrollment;
end;
$$;

revoke all on function public.decide_student_enrollment(uuid, text, text) from public;
grant execute on function public.decide_student_enrollment(uuid, text, text) to authenticated;

create table if not exists public.student_consents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  organization text not null check (char_length(trim(organization)) between 1 and 200),
  purpose text not null check (char_length(trim(purpose)) between 1 and 500),
  data_categories text[] not null default '{}',
  version text not null check (char_length(trim(version)) between 1 and 50),
  status text not null default 'pending' check (status in ('pending', 'granted', 'declined', 'withdrawn')),
  requested_at timestamptz not null default timezone('utc', now()),
  decided_at timestamptz null,
  withdrawal_allowed boolean not null default true,
  constraint student_consents_request_unique unique (student_id, organization, purpose, version)
);

create table if not exists public.student_activity (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null,
  description text not null,
  status_from text null,
  status_to text null,
  actor_id uuid null,
  actor_label text null,
  occurred_at timestamptz not null default timezone('utc', now())
);

create index if not exists student_consents_student_requested_idx
  on public.student_consents (student_id, requested_at desc);
create index if not exists student_activity_student_occurred_idx
  on public.student_activity (student_id, occurred_at desc);

alter table public.student_consents enable row level security;
alter table public.student_activity enable row level security;

create policy "Candidates can read their own consent requests"
  on public.student_consents for select to authenticated
  using (student_id = (select auth.uid()) and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student');

create policy "Candidates can read their own activity"
  on public.student_activity for select to authenticated
  using (student_id = (select auth.uid()) and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student');

create or replace function public.decide_student_consent(
  p_consent_id uuid,
  p_decision text
)
returns public.student_consents
language plpgsql
security definer
set search_path = public
as $$
declare
  consent public.student_consents;
  previous_status text;
begin
  if ((select auth.jwt()) -> 'app_metadata' ->> 'role') <> 'student' then
    raise exception 'candidate role required';
  end;
  if p_decision not in ('granted', 'declined', 'withdrawn') then
    raise exception 'invalid consent decision';
  end;

  select * into consent from public.student_consents where id = p_consent_id;
  if not found then raise exception 'consent request not found'; end if;
  if consent.student_id <> (select auth.uid()) then raise exception 'consent request does not belong to candidate'; end if;

  previous_status := consent.status;
  if p_decision = 'withdrawn' then
    if consent.status <> 'granted' or not consent.withdrawal_allowed then
      raise exception 'this consent cannot be withdrawn';
    end if;
  elsif consent.status <> 'pending' then
    raise exception 'consent decision already recorded';
  end if;

  update public.student_consents
  set status = p_decision,
      decided_at = timezone('utc', now())
  where id = consent.id
    and (
      (p_decision = 'withdrawn' and status = 'granted' and withdrawal_allowed)
      or (p_decision <> 'withdrawn' and status = 'pending')
    )
  returning * into consent;
  if not found then raise exception 'consent decision already recorded'; end if;

  insert into public.student_activity
    (student_id, event_type, description, status_from, status_to, actor_id, actor_label)
  values
    (consent.student_id, 'consent_changed', consent.organization || ' consent request', previous_status, p_decision,
     (select auth.uid()), 'Candidate');

  return consent;
end;
$$;

create or replace function public.require_candidate_consent(p_student_id uuid, p_organization text, p_purpose text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.student_consents
    where student_id = p_student_id
      and organization = p_organization
      and purpose = p_purpose
      and status = 'granted'
  );
$$;

revoke all on function public.decide_student_consent(uuid, text) from public;
revoke all on function public.require_candidate_consent(uuid, text, text) from public;
grant execute on function public.decide_student_consent(uuid, text) to authenticated;

create or replace function public.record_candidate_profile_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.student_activity
    (student_id, event_type, description, status_from, status_to, actor_id, actor_label)
  values
    (new.user_id, 'profile_changed', 'Candidate profile updated', null, null, coalesce((select auth.uid()), new.user_id), 'Candidate');
  return new;
end;
$$;

drop trigger if exists student_profile_activity on public.student_profiles;
create trigger student_profile_activity
after insert or update on public.student_profiles
for each row execute function public.record_candidate_profile_activity();

revoke insert, update, delete on public.student_activity from authenticated;
grant select on public.student_activity to authenticated;

create table if not exists public.student_notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (category in ('enrollment', 'consent', 'verification', 'credential', 'profile', 'activity')),
  title text not null check (char_length(trim(title)) between 1 and 200),
  message text not null check (char_length(trim(message)) between 1 and 1000),
  source_type text null,
  source_id text null,
  read_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint student_notifications_source_unique unique (student_id, source_type, source_id)
);

create index if not exists student_notifications_recipient_created_idx
  on public.student_notifications (student_id, created_at desc);

alter table public.student_notifications enable row level security;

create policy "Candidates can read their own notifications"
  on public.student_notifications for select to authenticated
  using (student_id = (select auth.uid()) and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student');

create or replace function public.create_candidate_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  category text;
  title text;
begin
  category := case
    when new.event_type = 'enrollment_decision' then 'enrollment'
    when new.event_type = 'consent_changed' then 'consent'
    when new.event_type in ('verification_changed', 'verification_completed') then 'verification'
    when new.event_type in ('credential_issued', 'credential_updated', 'credential_changed') then 'credential'
    when new.event_type = 'profile_changed' then 'profile'
    else 'activity'
  end;
  title := case category
    when 'enrollment' then 'Enrollment update'
    when 'consent' then 'Consent update'
    when 'verification' then 'Verification update'
    when 'credential' then 'Credential update'
    when 'profile' then 'Profile update'
    else 'Candidate account update'
  end;

  insert into public.student_notifications
    (student_id, category, title, message, source_type, source_id)
  values
    (new.student_id, category, title, new.description,
     'student_activity', new.id::text)
  on conflict (student_id, source_type, source_id) do nothing;
  return new;
end;
$$;

drop trigger if exists student_activity_notification on public.student_activity;
create trigger student_activity_notification
after insert on public.student_activity
for each row execute function public.create_candidate_notification();

create or replace function public.mark_student_notification_read(p_notification_id uuid)
returns public.student_notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  notification public.student_notifications;
begin
  if ((select auth.jwt()) -> 'app_metadata' ->> 'role') <> 'student' then
    raise exception 'candidate role required';
  end;
  select * into notification from public.student_notifications where id = p_notification_id;
  if not found then raise exception 'notification not found'; end if;
  if notification.student_id <> (select auth.uid()) then raise exception 'notification does not belong to candidate'; end if;
  update public.student_notifications set read_at = coalesce(read_at, timezone('utc', now()))
    where id = notification.id returning * into notification;
  return notification;
end;
$$;

revoke all on table public.student_notifications from authenticated;
grant select on public.student_notifications to authenticated;
revoke all on function public.mark_student_notification_read(uuid) from public;
grant execute on function public.mark_student_notification_read(uuid) to authenticated;
revoke insert, update, delete on public.student_consents from authenticated;
grant select on public.student_consents to authenticated;

create table if not exists public.student_credentials (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 200),
  issuer text not null check (char_length(trim(issuer)) between 1 and 200),
  unique_identifier text not null,
  verification_reference text not null unique check (char_length(verification_reference) >= 16 and char_length(verification_reference) <= 128),
  issued_at timestamptz not null,
  valid_from timestamptz not null default timezone('utc', now()),
  valid_until timestamptz null,
  status text not null default 'valid' check (status in ('valid', 'expired', 'revoked', 'unverifiable')),
  revoked_at timestamptz null,
  details text null,
  constraint student_credentials_unique_identifier unique (student_id, unique_identifier)
);
create index if not exists student_credentials_student_idx on public.student_credentials (student_id, issued_at desc);
alter table public.student_credentials enable row level security;
create policy "Candidates can read their own credentials"
  on public.student_credentials for select to authenticated
  using (student_id = (select auth.uid()) and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student');

create table if not exists public.student_verifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  credential_id uuid null references public.student_credentials (id) on delete set null,
  record_reference text not null,
  requesting_organization text null,
  disclosure_allowed boolean not null default false,
  requested_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz null,
  outcome text not null default 'pending',
  status text not null check (status in ('pending', 'successful', 'unsuccessful', 'expired', 'revoked', 'invalid'))
);
create index if not exists student_verifications_student_idx on public.student_verifications (student_id, requested_at desc);
alter table public.student_verifications enable row level security;
create policy "Candidates can read their own verification records"
  on public.student_verifications for select to authenticated
  using (student_id = (select auth.uid()) and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student');

create or replace function public.verify_candidate_credential(p_reference text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  credential public.student_credentials;
  effective_status text;
begin
  if p_reference is null or char_length(p_reference) < 16 or char_length(p_reference) > 128 then
    return jsonb_build_object('verified', false, 'status', 'invalid');
  end;
  select * into credential from public.student_credentials where verification_reference = p_reference;
  if not found then return jsonb_build_object('verified', false, 'status', 'invalid'); end if;
  if credential.status = 'unverifiable' then effective_status := 'unverifiable';
  elsif credential.revoked_at is not null or credential.status = 'revoked' then effective_status := 'revoked';
  elsif credential.valid_until is not null and credential.valid_until < timezone('utc', now()) then effective_status := 'expired';
  elsif credential.valid_from > timezone('utc', now()) then effective_status := 'unverifiable';
  else effective_status := 'valid'; end if;
  return jsonb_build_object(
    'verified', effective_status = 'valid',
    'status', effective_status,
    'title', credential.title,
    'issuer', credential.issuer,
    'issued_at', credential.issued_at,
    'valid_from', credential.valid_from,
    'valid_until', credential.valid_until
  );
end;
$$;

revoke all on public.student_credentials from authenticated;
revoke all on public.student_verifications from authenticated;
grant select on public.student_credentials to authenticated;
grant select on public.student_verifications to authenticated;
revoke all on function public.verify_candidate_credential(text) from public;
grant execute on function public.verify_candidate_credential(text) to anon, authenticated;

create table if not exists public.student_settings (
  student_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  enrollment_notifications boolean not null default true,
  consent_notifications boolean not null default true,
  verification_notifications boolean not null default true,
  credential_notifications boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint student_settings_owner_is_student check (student_id is not null)
);

alter table public.student_settings enable row level security;

create policy "Candidates can read their own settings"
  on public.student_settings for select to authenticated
  using (student_id = (select auth.uid()) and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student');

create policy "Candidates can insert their own settings"
  on public.student_settings for insert to authenticated
  with check (student_id = (select auth.uid()) and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student');

create policy "Candidates can update their own settings"
  on public.student_settings for update to authenticated
  using (student_id = (select auth.uid()) and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student')
  with check (student_id = (select auth.uid()) and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'student');

