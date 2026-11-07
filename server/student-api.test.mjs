import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, test } from 'node:test';
import { createStudentApi, validateStudentProfile, validateStudentSettings, validateStudentPassword } from './student-api.mjs';

const servers = new Set();

afterEach(async () => {
  await Promise.all([...servers].map((server) => new Promise((resolve) => server.close(resolve))));
  servers.clear();
});

function createFixture({ secureCookies = false } = {}) {
  const users = new Map([
    ['token-a', { id: 'candidate-a', email: 'a@example.test', app_metadata: { role: 'student' }, user_metadata: {} }],
    ['token-b', { id: 'candidate-b', email: 'b@example.test', app_metadata: { role: 'student' }, user_metadata: {} }],
    ['token-college', { id: 'college-a', email: 'college@example.test', app_metadata: { role: 'college' }, user_metadata: {} }],
  ]);
  const profiles = new Map();
  const settings = new Map();
  const consents = [{
    id: 'consent-a', student_id: 'candidate-a', organization: 'North College', purpose: 'Enrollment status verification',
    data_categories: ['enrollment status'], version: '1.0', status: 'pending', requested_at: '2026-10-01T00:00:00Z',
    decided_at: null, withdrawal_allowed: true,
  }];
  const activity = [{ id: 'activity-a', student_id: 'candidate-a', event_type: 'consent_changed', description: 'North College consent request', status_from: null, status_to: 'pending', actor_id: null, actor_label: 'Institution', occurred_at: '2026-10-01T00:00:00Z' }];
  const notifications = [{ id: 'notification-a', student_id: 'candidate-a', category: 'consent', title: 'Consent update', message: 'North College consent request', source_type: 'student_activity', source_id: 'activity-a', read_at: null, created_at: '2026-10-01T00:00:00Z' }];
  const credentials = [
    { id: 'credential-a', student_id: 'candidate-a', title: 'Engineering Diploma', issuer: 'North College', unique_identifier: 'CREDENTIAL-A-001', verification_reference: 'CredentialRefA001', issued_at: '2026-09-01T00:00:00Z', valid_from: '2026-09-01T00:00:00Z', valid_until: '2028-09-01T00:00:00Z', status: 'valid', revoked_at: null, details: 'Awarded to the candidate.' },
    { id: 'credential-b', student_id: 'candidate-b', title: 'Other Diploma', issuer: 'South College', unique_identifier: 'CREDENTIAL-B-001', verification_reference: 'CredentialRefB001', issued_at: '2026-09-01T00:00:00Z', valid_from: '2026-09-01T00:00:00Z', valid_until: null, status: 'revoked', revoked_at: '2026-10-01T00:00:00Z', details: null },
  ];
  const verifications = [{ id: 'verification-a', student_id: 'candidate-a', credential_id: 'credential-a', record_reference: 'VERIFY-A-001', requesting_organization: 'Verifier Organization', disclosure_allowed: false, requested_at: '2026-10-02T00:00:00Z', completed_at: '2026-10-02T01:00:00Z', outcome: 'Successful', status: 'successful' }];
  const enrollments = [
    { id: 'enrollment-a', student_id: 'candidate-a', reference: 'ENR-A', program: 'Engineering', institution: 'North College', submitted_at: '2026-10-01T00:00:00Z', status: 'awaiting_candidate', deadline: null, terms: 'Complete the offered programme.', candidate_decision_at: null, candidate_rejection_reason: null },
    { id: 'enrollment-a2', student_id: 'candidate-a', reference: 'ENR-A2', program: 'Applied Sciences', institution: 'West College', submitted_at: '2026-10-03T00:00:00Z', status: 'under_review', deadline: '2026-11-01T00:00:00Z', terms: null, candidate_decision_at: null, candidate_rejection_reason: null },
    { id: 'enrollment-b', student_id: 'candidate-b', reference: 'ENR-B', program: 'Sciences', institution: 'South College', submitted_at: '2026-10-02T00:00:00Z', status: 'under_review', deadline: '2026-11-01T00:00:00Z', terms: null, candidate_decision_at: null, candidate_rejection_reason: null },
  ];

  function createClient(_url, _key, options = {}) {
    const authorization = options.global?.headers?.Authorization ?? '';
    const bearerToken = authorization.replace(/^Bearer\s+/i, '').trim();
    const actingUser = bearerToken ? users.get(bearerToken) : null;
    return {
      auth: {
        getUser: async (token) => users.has(token)
          ? { data: { user: users.get(token) }, error: null }
          : { data: { user: null }, error: new Error('Invalid access token') },
        refreshSession: async ({ refresh_token }) => {
          const user = users.get(refresh_token);
          return user
            ? { data: { user, session: { access_token: refresh_token, refresh_token } }, error: null }
            : { data: { user: null, session: null }, error: new Error('Invalid refresh token') };
        },
        signInWithPassword: async ({ email, password }) => {
          if (password !== 'correct-password') return { data: { user: null, session: null }, error: new Error('Invalid credentials') };
          const found = [...users.entries()].find(([, user]) => user.email === email);
          if (!found) return { data: { user: null, session: null }, error: new Error('Invalid credentials') };
          const [token, user] = found;
          return { data: { user, session: { access_token: token, refresh_token: token } }, error: null };
        },
        setSession: async () => ({ data: {}, error: null }),
        signOut: async () => ({ error: null }),
        updateUser: async ({ password }) => actingUser && password.length >= 8 && password.length <= 72
          ? { data: { user: actingUser }, error: null }
          : { data: null, error: new Error('Password update rejected') },
      },
      rpc(name, args) {
        if (name === 'verify_candidate_credential') {
          const credential = credentials.find((item) => item.verification_reference === args.p_reference);
          if (!credential) return Promise.resolve({ data: { verified: false, status: 'invalid' }, error: null });
          const revoked = credential.status === 'revoked' || credential.revoked_at;
          const status = revoked ? 'revoked' : (credential.valid_until && new Date(credential.valid_until) < new Date()) ? 'expired' : credential.status;
          return Promise.resolve({ data: { verified: status === 'valid', status, title: credential.title, issuer: credential.issuer, issued_at: credential.issued_at, valid_from: credential.valid_from, valid_until: credential.valid_until }, error: null });
        }
        if (name === 'mark_student_notification_read') {
          const notification = notifications.find((item) => item.id === args.p_notification_id);
          if (!notification) return Promise.resolve({ data: null, error: { message: 'notification not found' } });
          if (!actingUser || notification.student_id !== actingUser.id) return Promise.resolve({ data: null, error: { message: 'notification does not belong to candidate' } });
          notification.read_at ||= new Date().toISOString();
          return Promise.resolve({ data: notification, error: null });
        }
        if (name === 'decide_student_consent') return (async () => {
          const consent = consents.find((item) => item.id === args.p_consent_id);
          if (!consent) return { data: null, error: { message: 'consent request not found' } };
          if (!actingUser || consent.student_id !== actingUser.id) return { data: null, error: { message: 'consent request does not belong to candidate' } };
          if (args.p_decision === 'withdrawn' && (consent.status !== 'granted' || !consent.withdrawal_allowed)) return { data: null, error: { message: 'this consent cannot be withdrawn' } };
          if (args.p_decision !== 'withdrawn' && consent.status !== 'pending') return { data: null, error: { message: 'consent decision already recorded' } };
          const previousStatus = consent.status;
          consent.status = args.p_decision;
          consent.decided_at = new Date().toISOString();
          activity.unshift({ id: `activity-${activity.length + 1}`, student_id: consent.student_id, event_type: 'consent_changed', description: consent.organization + ' consent request', status_from: previousStatus, status_to: consent.status, actor_id: actingUser.id, actor_label: 'Candidate', occurred_at: consent.decided_at });
          return { data: consent, error: null };
        })();
        if (name !== 'decide_student_enrollment') return Promise.resolve({ data: null, error: new Error('Unknown function') });
        return (async () => {
          const enrollment = enrollments.find((item) => item.id === args.p_enrollment_id);
          if (!enrollment) return { data: null, error: { message: 'enrollment not found' } };
          if (!actingUser || enrollment.student_id !== actingUser.id) return { data: null, error: { message: 'enrollment does not belong to candidate' } };
          const normalized = enrollment.status.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
          if (!['awaiting candidate', 'awaiting confirmation'].includes(normalized)) return { data: null, error: { message: 'candidate decision already been recorded' } };
          if (!['confirm', 'reject'].includes(args.p_decision)) return { data: null, error: { message: 'invalid candidate decision' } };
          if (args.p_rejection_reason && args.p_rejection_reason.length > 500) return { data: null, error: { message: 'rejection reason is too long' } };
          enrollment.status = args.p_decision === 'confirm' ? 'candidate_confirmed' : 'candidate_rejected';
          enrollment.candidate_decision = args.p_decision === 'confirm' ? 'confirmed' : 'rejected';
          enrollment.candidate_decision_at = new Date().toISOString();
          enrollment.candidate_rejection_reason = args.p_decision === 'reject' ? args.p_rejection_reason : null;
          return { data: enrollment, error: null };
        })();
      },
      from(table) {
        let ownerId;
        let rowToSave;
        const query = {
          select() { return this; },
          eq(column, value) {
            assert.ok((table === 'student_profiles' && column === 'user_id') ||
              (table === 'student_enrollments' && column === 'student_id') ||
              (table === 'student_consents' && column === 'student_id') ||
              (table === 'student_activity' && ['student_id', 'event_type'].includes(column)) ||
              (table === 'student_notifications' && column === 'student_id') ||
              (table === 'student_credentials' && column === 'student_id') ||
              (table === 'student_verifications' && column === 'student_id') ||
              (table === 'student_settings' && column === 'student_id'));
            if (column === 'student_id') ownerId = value;
            return this;
          },
          maybeSingle: async () => ({ data: table === 'student_settings' ? settings.get(ownerId) ?? null : profiles.get(ownerId) ?? null, error: null }),
          upsert(row) {
            rowToSave = row;
            ownerId = row.user_id ?? row.student_id;
            return this;
          },
          single: async () => {
            if (table === 'student_settings') {
              settings.set(ownerId, { theme: rowToSave.theme, enrollment_notifications: rowToSave.enrollment_notifications, consent_notifications: rowToSave.consent_notifications, verification_notifications: rowToSave.verification_notifications, credential_notifications: rowToSave.credential_notifications, updated_at: rowToSave.updated_at });
              return { data: settings.get(ownerId), error: null };
            }
            profiles.set(ownerId, { display_name: rowToSave.display_name, phone: rowToSave.phone });
            return { data: profiles.get(ownerId), error: null };
          },
          order: async (column, { ascending }) => {
            const rows = table === 'student_consents'
              ? consents.filter((consent) => consent.student_id === ownerId)
              : table === 'student_activity'
                ? activity.filter((entry) => entry.student_id === ownerId)
                : table === 'student_notifications'
                  ? notifications.filter((entry) => entry.student_id === ownerId)
                  : table === 'student_credentials'
                    ? credentials.filter((entry) => entry.student_id === ownerId)
                    : table === 'student_verifications'
                      ? verifications.filter((entry) => entry.student_id === ownerId)
                      : enrollments.filter((enrollment) => enrollment.student_id === ownerId);
            const dateColumn = table === 'student_consents' ? 'requested_at' : table === 'student_activity' ? 'occurred_at' : table === 'student_notifications' ? 'created_at' : table === 'student_credentials' ? 'issued_at' : table === 'student_verifications' ? 'requested_at' : 'submitted_at';
            return { data: rows.sort((left, right) => ascending ? left[dateColumn].localeCompare(right[dateColumn]) : right[dateColumn].localeCompare(left[dateColumn])), error: null };
          },
        };
        return query;
      },
    };
  }

  return {
    users,
    profiles,
    enrollments,
    consents,
    activity,
    notifications,
    settings,
    credentials,
    verifications,
    app: createStudentApi({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'test-anon-key',
      createClient,
      allowedOrigin: 'http://localhost:3000',
      secureCookies,
      logger: { error() {} },
    }),
  };
}

async function startApi(app) {
  const server = app.listen(0, '127.0.0.1');
  servers.add(server);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

function authHeaders(token = 'token-a') {
  return {
    cookie: `student_access=${token}; student_refresh=${token}`,
    origin: 'http://localhost:3000',
  };
}

test('profile validator allows only the approved editable fields', () => {
  assert.deepEqual(validateStudentProfile({ display_name: ' Candidate A ', phone: '+1 555-123-4567' }).value, {
    display_name: 'Candidate A',
    phone: '+1 555-123-4567',
  });
  assert.deepEqual(validateStudentProfile({ display_name: 'Candidate A', phone: '' }).value, {
    display_name: 'Candidate A',
    phone: null,
  });
  assert.equal(validateStudentProfile({ display_name: 'Candidate A', phone: '', email: 'changed@example.test' }).error.code, 'INVALID_PROFILE');
  assert.equal(validateStudentProfile({ display_name: '', phone: 'bad' }).error.code, 'VALIDATION_ERROR');
});

test('profile endpoints require an authenticated candidate role', async () => {
  const { app } = createFixture();
  const baseUrl = await startApi(app);
  const anonymousResponse = await fetch(`${baseUrl}/api/student/profile`);
  assert.equal(anonymousResponse.status, 401);

  const nonCandidateResponse = await fetch(`${baseUrl}/api/student/profile`, {
    headers: authHeaders('token-college'),
  });
  assert.equal(nonCandidateResponse.status, 403);
});

test('profile persistence is scoped to the authenticated candidate and rejects protected fields', async () => {
  const { app, profiles } = createFixture();
  const baseUrl = await startApi(app);
  const response = await fetch(`${baseUrl}/api/student/profile`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({ display_name: 'Candidate A', phone: '+1 555-123-4567' }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(profiles.get('candidate-a'), { display_name: 'Candidate A', phone: '+1 555-123-4567' });
  assert.equal(profiles.has('candidate-b'), false);

  const protectedFieldResponse = await fetch(`${baseUrl}/api/student/profile`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({ display_name: 'Candidate A', phone: '', user_id: 'candidate-b' }),
  });
  assert.equal(protectedFieldResponse.status, 400);
  assert.equal(profiles.get('candidate-a').display_name, 'Candidate A');

  const otherCandidateResponse = await fetch(`${baseUrl}/api/student/profile`, {
    headers: authHeaders('token-b'),
  });
  assert.equal(otherCandidateResponse.status, 200);
  const otherCandidateProfile = await otherCandidateResponse.json();
  assert.equal(otherCandidateProfile.data.email, 'b@example.test');
  assert.equal(otherCandidateProfile.data.display_name, '');
});

test('enrollment endpoint returns only rows owned by the authenticated candidate', async () => {
  const { app } = createFixture();
  const baseUrl = await startApi(app);
  const response = await fetch(`${baseUrl}/api/student/enrollments`, { headers: authHeaders() });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.data.enrollments.map((enrollment) => enrollment.reference), ['ENR-A2', 'ENR-A']);
});

test('candidate enrollment decisions require ownership, permission, and a valid pending state', async () => {
  const { app, enrollments } = createFixture();
  const baseUrl = await startApi(app);

  const unauthorized = await fetch(`${baseUrl}/api/student/enrollments/enrollment-a/decision`, {
    method: 'POST', headers: { ...authHeaders('token-b'), 'content-type': 'application/json' }, body: JSON.stringify({ decision: 'confirm' }),
  });
  assert.equal(unauthorized.status, 404);

  const invalidTransition = await fetch(`${baseUrl}/api/student/enrollments/enrollment-a2/decision`, {
    method: 'POST', headers: { ...authHeaders(), 'content-type': 'application/json' }, body: JSON.stringify({ decision: 'confirm' }),
  });
  assert.equal(invalidTransition.status, 409);

  const college = await fetch(`${baseUrl}/api/student/enrollments/enrollment-a/decision`, {
    method: 'POST', headers: { ...authHeaders('token-college'), 'content-type': 'application/json' }, body: JSON.stringify({ decision: 'confirm' }),
  });
  assert.equal(college.status, 403);

  const confirmed = await fetch(`${baseUrl}/api/student/enrollments/enrollment-a/decision`, {
    method: 'POST', headers: { ...authHeaders(), 'content-type': 'application/json' }, body: JSON.stringify({ decision: 'confirm' }),
  });
  assert.equal(confirmed.status, 200);
  assert.equal(enrollments.find((item) => item.id === 'enrollment-a').status, 'candidate_confirmed');

  const duplicate = await fetch(`${baseUrl}/api/student/enrollments/enrollment-a/decision`, {
    method: 'POST', headers: { ...authHeaders(), 'content-type': 'application/json' }, body: JSON.stringify({ decision: 'reject', rejection_reason: 'Changed my mind' }),
  });
  assert.equal(duplicate.status, 409);
});

test('candidate rejection records an optional reason and rejects oversized reasons', async () => {
  const { app, enrollments } = createFixture();
  enrollments.find((item) => item.id === 'enrollment-a').status = 'awaiting confirmation';
  const baseUrl = await startApi(app);
  const tooLong = await fetch(`${baseUrl}/api/student/enrollments/enrollment-a/decision`, {
    method: 'POST', headers: { ...authHeaders(), 'content-type': 'application/json' }, body: JSON.stringify({ decision: 'reject', rejection_reason: 'x'.repeat(501) }),
  });
  assert.equal(tooLong.status, 400);

  const rejected = await fetch(`${baseUrl}/api/student/enrollments/enrollment-a/decision`, {
    method: 'POST', headers: { ...authHeaders(), 'content-type': 'application/json' }, body: JSON.stringify({ decision: 'reject', rejection_reason: '  Programme no longer available  ' }),
  });
  assert.equal(rejected.status, 200);
  const enrollment = enrollments.find((item) => item.id === 'enrollment-a');
  assert.equal(enrollment.status, 'candidate_rejected');
  assert.equal(enrollment.candidate_rejection_reason, 'Programme no longer available');
  assert.ok(enrollment.candidate_decision_at);
});

test('candidate sign-in creates secure, HTTP-only session cookies', async () => {
  const { app } = createFixture({ secureCookies: true });
  const baseUrl = await startApi(app);
  const response = await fetch(`${baseUrl}/api/student/session`, {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'a@example.test', password: 'correct-password' }),
  });
  assert.equal(response.status, 200);
  const cookies = response.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  assert.ok(cookies.every((cookie) => cookie.includes('HttpOnly') && cookie.includes('SameSite=Strict') && cookie.includes('Secure')));
  assert.ok(cookies.every((cookie) => cookie.startsWith('student_')));
});

test('candidate sign-in rejects accounts without the student role', async () => {
  const { app } = createFixture();
  const baseUrl = await startApi(app);
  const response = await fetch(`${baseUrl}/api/student/session`, {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'college@example.test', password: 'correct-password' }),
  });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('set-cookie'), null);
});

test('candidate sign-in is rate-limited', async () => {
  const { app } = createFixture();
  const baseUrl = await startApi(app);
  let finalResponse;
  for (let attempt = 0; attempt < 11; attempt += 1) {
    finalResponse = await fetch(`${baseUrl}/api/student/session`, {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@example.test', password: 'incorrect-password' }),
    });
  }
  assert.equal(finalResponse.status, 429);
});

test('candidate consent decisions are owner-scoped and activity is immutable and candidate-scoped', async () => {
  const { app } = createFixture();
  const baseUrl = await startApi(app);
  const consentsResponse = await fetch(`${baseUrl}/api/student/consents`, { headers: authHeaders() });
  assert.equal(consentsResponse.status, 200);
  const consents = await consentsResponse.json();
  assert.equal(consents.data.consents.length, 1);

  const grantResponse = await fetch(`${baseUrl}/api/student/consents/consent-a/decision`, {
    method: 'POST', headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({ decision: 'grant' }),
  });
  assert.equal(grantResponse.status, 200);
  const grant = await grantResponse.json();
  assert.equal(grant.data.consent.status, 'granted');

  const duplicateResponse = await fetch(`${baseUrl}/api/student/consents/consent-a/decision`, {
    method: 'POST', headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({ decision: 'decline' }),
  });
  assert.equal(duplicateResponse.status, 409);

  const withdrawResponse = await fetch(`${baseUrl}/api/student/consents/consent-a/decision`, {
    method: 'POST', headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({ decision: 'withdraw' }),
  });
  assert.equal(withdrawResponse.status, 200);
  const activityResponse = await fetch(`${baseUrl}/api/student/activity`, { headers: authHeaders('token-b') });
  assert.equal(activityResponse.status, 200);
  const activity = await activityResponse.json();
  assert.equal(activity.data.activity.length, 0);
});

test('notifications are recipient-scoped, chronological, and marked read once', async () => {
  const { app } = createFixture();
  const baseUrl = await startApi(app);
  const response = await fetch(`${baseUrl}/api/student/notifications`, { headers: authHeaders() });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.data.notifications.length, 1);
  assert.equal(payload.data.notifications[0].read_at, null);

  const markResponse = await fetch(`${baseUrl}/api/student/notifications/notification-a/read`, {
    method: 'PATCH', headers: { ...authHeaders(), 'content-type': 'application/json' }, body: '{}',
  });
  assert.equal(markResponse.status, 200);
  const marked = await markResponse.json();
  assert.ok(marked.data.notification.read_at);

  const otherResponse = await fetch(`${baseUrl}/api/student/notifications/notification-a/read`, {
    method: 'PATCH', headers: { ...authHeaders('token-b'), 'content-type': 'application/json' }, body: '{}',
  });
  assert.equal(otherResponse.status, 404);
});

test('credentials and verifications are candidate-scoped and public verification is minimized', async () => {
  const { app } = createFixture();
  const baseUrl = await startApi(app);

  const credentialsResponse = await fetch(`${baseUrl}/api/student/credentials`, { headers: authHeaders() });
  assert.equal(credentialsResponse.status, 200);
  const credentialsPayload = await credentialsResponse.json();
  assert.deepEqual(credentialsPayload.data.credentials.map((item) => item.id), ['credential-a']);

  const verificationsResponse = await fetch(`${baseUrl}/api/student/verifications`, { headers: authHeaders() });
  assert.equal(verificationsResponse.status, 200);
  const verificationsPayload = await verificationsResponse.json();
  assert.equal(verificationsPayload.data.verifications[0].requesting_organization, null);

  const publicResponse = await fetch(`${baseUrl}/api/public/credentials/CredentialRefA001`);
  assert.equal(publicResponse.status, 200);
  const publicPayload = await publicResponse.json();
  assert.equal(publicPayload.data.credential.status, 'valid');
  assert.equal(publicPayload.data.credential.title, 'Engineering Diploma');
  assert.equal('student_id' in publicPayload.data.credential, false);

  const revokedResponse = await fetch(`${baseUrl}/api/public/credentials/CredentialRefB001`);
  assert.equal(revokedResponse.status, 200);
  const revokedPayload = await revokedResponse.json();
  assert.equal(revokedPayload.data.credential.status, 'revoked');

  const invalidResponse = await fetch(`${baseUrl}/api/public/credentials/unknown-reference`);
  assert.equal(invalidResponse.status, 404);
});

test('candidate settings validate and persist only for the authenticated owner', async () => {
  assert.equal(validateStudentSettings({ theme: 'blue' }).error.code, 'VALIDATION_ERROR');
  assert.equal(validateStudentSettings({ email: 'changed@example.test' }).error.code, 'INVALID_SETTINGS');
  assert.equal(validateStudentPassword({ current_password: 'correct-password', new_password: 'short' }).error.code, 'VALIDATION_ERROR');
  assert.equal(validateStudentPassword({ current_password: 'same-password', new_password: 'same-password' }).error.code, 'VALIDATION_ERROR');

  const { app } = createFixture();
  const baseUrl = await startApi(app);
  const initial = await fetch(`${baseUrl}/api/student/settings`, { headers: authHeaders() });
  assert.equal(initial.status, 200);
  assert.equal((await initial.json()).data.settings.theme, 'system');

  const savedResponse = await fetch(`${baseUrl}/api/student/settings`, {
    method: 'PUT', headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({ theme: 'dark', enrollment_notifications: false, consent_notifications: true, verification_notifications: true, credential_notifications: false }),
  });
  assert.equal(savedResponse.status, 200);
  const saved = await savedResponse.json();
  assert.equal(saved.data.settings.theme, 'dark');
  assert.equal(saved.data.settings.enrollment_notifications, false);

  const refreshed = await fetch(`${baseUrl}/api/student/settings`, { headers: authHeaders() });
  assert.equal((await refreshed.json()).data.settings.theme, 'dark');

  const passwordResponse = await fetch(`${baseUrl}/api/student/password`, {
    method: 'PATCH', headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({ current_password: 'correct-password', new_password: 'new-secure-password' }),
  });
  assert.equal(passwordResponse.status, 200);
  assert.equal((await passwordResponse.json()).data.passwordChanged, true);

  const wrongPassword = await fetch(`${baseUrl}/api/student/password`, {
    method: 'PATCH', headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({ current_password: 'incorrect-password', new_password: 'another-secure-password' }),
  });
  assert.equal(wrongPassword.status, 401);
});

test('state-changing requests reject untrusted origins', async () => {
  const { app } = createFixture();
  const baseUrl = await startApi(app);
  const response = await fetch(`${baseUrl}/api/student/profile`, {
    method: 'PATCH',
    headers: { ...authHeaders(), origin: 'https://untrusted.example', 'content-type': 'application/json' },
    body: JSON.stringify({ display_name: 'Candidate A', phone: '' }),
  });
  assert.equal(response.status, 403);
});

test('migration enables candidate-only row policies and read-only enrollment access', async () => {
  const migration = await readFile(new URL('../supabase/migrations/202610260001_student_portal.sql', import.meta.url), 'utf8');
  assert.match(migration, /alter table public\.student_profiles enable row level security/i);
  assert.match(migration, /alter table public\.student_enrollments enable row level security/i);
  assert.match(migration, /auth\.uid\(\)\) = user_id/);
  assert.match(migration, /auth\.uid\(\)\) = student_id/);
  assert.match(migration, /auth\.jwt\(\).*app_metadata.*role.*student/s);
  assert.doesNotMatch(migration, /create policy[^;]*student_enrollments for (insert|update|delete)/i);
  assert.match(migration, /create or replace function public\.decide_student_enrollment/i);
  assert.match(migration, /candidate_confirmed/i);
  assert.match(migration, /candidate_rejected/i);
  assert.match(migration, /where id = enrollment\.id/i);
  assert.match(migration, /create table if not exists public\.student_settings/i);
  assert.match(migration, /Candidates can update their own settings/i);
  assert.match(migration, /security definer/i);
});
