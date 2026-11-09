import express from 'express';
import { rateLimit } from 'express-rate-limit';

const COOKIE_ACCESS = 'student_access';
const COOKIE_REFRESH = 'student_refresh';
const COOKIE_OPTIONS = (secure) => ({
  httpOnly: true,
  secure,
  sameSite: 'strict',
  path: '/api',
});
const profileColumns = 'display_name, phone';
const enrollmentColumns = 'id, reference, program, institution, submitted_at, status, deadline, terms, candidate_decision_at, candidate_rejection_reason';

export function validateStudentSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: { code: 'INVALID_SETTINGS', message: 'Provide settings to update.' } };
  }
  const allowed = new Set(['theme', 'enrollment_notifications', 'consent_notifications', 'verification_notifications', 'credential_notifications']);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    return { error: { code: 'INVALID_SETTINGS', message: 'One or more settings cannot be changed.' } };
  }
  if (input.theme !== undefined && !['system', 'light', 'dark'].includes(input.theme)) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Choose a supported theme.', fieldErrors: { theme: 'Choose system, light, or dark.' } } };
  }
  for (const key of ['enrollment_notifications', 'consent_notifications', 'verification_notifications', 'credential_notifications']) {
    if (input[key] !== undefined && typeof input[key] !== 'boolean') {
      return { error: { code: 'VALIDATION_ERROR', message: 'Notification preferences must be enabled or disabled.', fieldErrors: { [key]: 'Choose enabled or disabled.' } } };
    }
  }
  return { value: input };
}

export function validateStudentPassword(input) {
  const { current_password, new_password } = input ?? {};
  if (typeof current_password !== 'string' || typeof new_password !== 'string') {
    return { error: { code: 'VALIDATION_ERROR', message: 'Enter both your current and new password.', fieldErrors: { current_password: 'Current password is required.', new_password: 'New password is required.' } } };
  }
  if (new_password.length < 8 || new_password.length > 72) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Use a new password between 8 and 72 characters.', fieldErrors: { new_password: 'Password must contain 8 to 72 characters.' } } };
  }
  if (new_password === current_password) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Choose a password different from your current password.', fieldErrors: { new_password: 'New password must be different.' } } };
  }
  return { value: { current_password, new_password } };
}

export function validateStudentProfile(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: { code: 'INVALID_PROFILE', message: 'Provide profile fields to update.' } };
  }

  const allowedKeys = new Set(['display_name', 'phone']);
  const unexpected = Object.keys(input).filter((key) => !allowedKeys.has(key));
  if (unexpected.length) {
    return { error: { code: 'INVALID_PROFILE', message: 'One or more fields cannot be changed.' } };
  }

  const fieldErrors = {};
  const displayName = typeof input.display_name === 'string' ? input.display_name.trim() : '';
  const rawPhone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const digits = rawPhone.replace(/\D/g, '');

  if (!displayName || displayName.length > 100 || /[\u0000-\u001f\u007f]/.test(displayName)) {
    fieldErrors.display_name = 'Enter a name between 1 and 100 characters.';
  }
  if (rawPhone && (!/^\+?[0-9][0-9 ()-]{5,30}$/.test(rawPhone) || digits.length < 7 || digits.length > 15)) {
    fieldErrors.phone = 'Enter a valid phone number with 7 to 15 digits.';
  }
  if (Object.keys(fieldErrors).length) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Check the highlighted profile fields.', fieldErrors } };
  }

  return { value: { display_name: displayName, phone: rawPhone || null } };
}

function sendError(response, status, code, message, fieldErrors) {
  response.status(status).json({ error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) } });
}

function userIsCandidate(user) {
  return user?.app_metadata?.role === 'student';
}

function clearSession(response, secure) {
  const options = COOKIE_OPTIONS(secure);
  response.clearCookie(COOKIE_ACCESS, options);
  response.clearCookie(COOKIE_REFRESH, options);
}

function setSession(response, session, secure) {
  const options = COOKIE_OPTIONS(secure);
  response.cookie(COOKIE_ACCESS, session.access_token, options);
  response.cookie(COOKIE_REFRESH, session.refresh_token, options);
}

function cookieValue(request, name) {
  const cookieHeader = request.headers.cookie ?? '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function createStudentApi({
  supabaseUrl,
  supabaseAnonKey,
  createClient,
  allowedOrigin,
  secureCookies = process.env.NODE_ENV !== 'development',
  logger = console,
}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb', strict: true }));

  app.use('/api', (request, response, next) => {
    response.set('Cache-Control', 'no-store');
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) return next();
    if (request.get('origin') !== allowedOrigin) {
      return sendError(response, 403, 'ORIGIN_NOT_ALLOWED', 'The request origin is not allowed.');
    }
    return next();
  });
  const signInLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { code: 'SIGN_IN_RATE_LIMITED', message: 'Too many sign-in attempts. Try again later.' } },
  });

  const makeClient = () => createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  async function authenticate(request, response, next, optional = false) {
    const accessToken = cookieValue(request, COOKIE_ACCESS);
    const refreshToken = cookieValue(request, COOKIE_REFRESH);
    if (!accessToken && !refreshToken) {
      if (optional) {
        request.student = null;
        return next();
      }
      return sendError(response, 401, 'AUTH_REQUIRED', 'Sign in to access the candidate portal.');
    }

    const client = makeClient();
    let user;
    let currentAccessToken = accessToken;
    if (accessToken) {
      const result = await client.auth.getUser(accessToken);
      if (!result.error) user = result.data.user;
    }

    if (!user && refreshToken) {
      const refreshed = await client.auth.refreshSession({ refresh_token: refreshToken });
      if (!refreshed.error && refreshed.data.session) {
        setSession(response, refreshed.data.session, secureCookies);
        currentAccessToken = refreshed.data.session.access_token;
        user = refreshed.data.user;
      }
    }

    if (!user) {
      clearSession(response, secureCookies);
      if (optional) {
        request.student = null;
        return next();
      }
      return sendError(response, 401, 'AUTH_REQUIRED', 'Your session has expired. Sign in again.');
    }
    if (!userIsCandidate(user)) {
      clearSession(response, secureCookies);
      return sendError(response, 403, 'STUDENT_ROLE_REQUIRED', 'This account is not authorized for the candidate portal.');
    }

    request.student = {
      user,
      client: createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { headers: { Authorization: 'Bearer ' + currentAccessToken } },
      }),
    };
    return next();
  }

  app.get('/api/health', (_request, response) => response.json({ data: { configured: true } }));

  app.get('/api/student/session', (request, response, next) => {
    authenticate(request, response, next, true);
  }, (request, response) => {
    response.json({ data: { user: request.student ? {
      id: request.student.user.id,
      email: request.student.user.email ?? '',
      lastSignInAt: request.student.user.last_sign_in_at ?? null,
      createdAt: request.student.user.created_at ?? null,
      emailConfirmed: request.student.user.email_confirmed_at ? true : request.student.user.confirmed_at ? true : false,
    } : null } });
  });

  app.post('/api/student/session', signInLimiter, async (request, response) => {
    const { email, password } = request.body ?? {};
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof password !== 'string' || !password) {
      return sendError(response, 400, 'VALIDATION_ERROR', 'Enter a valid email and password.');
    }

    const client = makeClient();
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.session || !data.user) {
      return sendError(response, 401, 'SIGN_IN_FAILED', 'Email or password is incorrect.');
    }
    if (!userIsCandidate(data.user)) {
      await client.auth.signOut({ scope: 'local' });
      return sendError(response, 403, 'STUDENT_ROLE_REQUIRED', 'This account is not authorized for the candidate portal.');
    }

    setSession(response, data.session, secureCookies);
    return response.json({ data: { user: { id: data.user.id, email: data.user.email ?? '' } } });
  });

  app.delete('/api/student/session', async (request, response) => {
    const accessToken = cookieValue(request, COOKIE_ACCESS);
    const refreshToken = cookieValue(request, COOKIE_REFRESH);
    if (accessToken && refreshToken) {
      const client = makeClient();
      const { error: sessionError } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) {
        clearSession(response, secureCookies);
        return sendError(response, 502, 'SIGN_OUT_FAILED', 'Could not safely end the session. Please try again.');
      }
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) {
        logger.error('Supabase sign-out failed', error);
        return sendError(response, 502, 'SIGN_OUT_FAILED', 'Could not safely end the session. Please try again.');
      }
    }
    clearSession(response, secureCookies);
    return response.json({ data: { signedOut: true } });
  });

  app.get('/api/student/settings', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const { data, error } = await request.student.client
      .from('student_settings')
      .select('theme, enrollment_notifications, consent_notifications, verification_notifications, credential_notifications, updated_at')
      .eq('student_id', request.student.user.id)
      .maybeSingle();
    if (error) return sendError(response, 502, 'SETTINGS_UNAVAILABLE', 'Preferences are temporarily unavailable.');
    return response.json({ data: { settings: data ?? { theme: 'system', enrollment_notifications: true, consent_notifications: true, verification_notifications: true, credential_notifications: true, updated_at: null } } });
  });

  app.put('/api/student/settings', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const validated = validateStudentSettings(request.body);
    if (validated.error) return sendError(response, 400, validated.error.code, validated.error.message, validated.error.fieldErrors);
    const values = validated.value;
    const { data, error } = await request.student.client
      .from('student_settings')
      .upsert({ student_id: request.student.user.id, ...values, updated_at: new Date().toISOString() }, { onConflict: 'student_id' })
      .select('theme, enrollment_notifications, consent_notifications, verification_notifications, credential_notifications, updated_at')
      .single();
    if (error) return sendError(response, 502, 'SETTINGS_UPDATE_FAILED', 'Preferences could not be saved.');
    return response.json({ data: { settings: data } });
  });

  app.patch('/api/student/password', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const validated = validateStudentPassword(request.body);
    if (validated.error) return sendError(response, 400, validated.error.code, validated.error.message, validated.error.fieldErrors);

    const verificationClient = makeClient();
    const { error: verificationError } = await verificationClient.auth.signInWithPassword({
      email: request.student.user.email,
      password: validated.value.current_password,
    });
    if (verificationError) return sendError(response, 401, 'CURRENT_PASSWORD_INVALID', 'The current password is incorrect.');

    const { error } = await request.student.client.auth.updateUser({ password: validated.value.new_password });
    if (error) return sendError(response, 502, 'PASSWORD_UPDATE_FAILED', 'The password could not be changed.');
    return response.json({ data: { passwordChanged: true } });
  });

  app.get('/api/student/profile', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const { data, error } = await request.student.client
      .from('student_profiles')
      .select(profileColumns)
      .eq('user_id', request.student.user.id)
      .maybeSingle();
    if (error) {
      logger.error('Student profile read failed', error);
      return sendError(response, 502, 'PROFILE_UNAVAILABLE', 'Profile information is temporarily unavailable.');
    }

    const metadata = request.student.user.user_metadata ?? {};
    return response.json({ data: {
      email: request.student.user.email ?? '',
      display_name: data?.display_name || metadata.display_name || metadata.full_name || '',
      phone: data?.phone ?? '',
    } });
  });

  app.patch('/api/student/profile', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const validation = validateStudentProfile(request.body);
    if (validation.error) {
      return sendError(response, 400, validation.error.code, validation.error.message, validation.error.fieldErrors);
    }

    const { data, error } = await request.student.client
      .from('student_profiles')
      .upsert({
        user_id: request.student.user.id,
        ...validation.value,
      }, { onConflict: 'user_id' })
      .select(profileColumns)
      .single();
    if (error) {
      logger.error('Student profile update failed', error);
      return sendError(response, 502, 'PROFILE_UPDATE_FAILED', 'Profile changes could not be saved.');
    }

    return response.json({ data: {
      email: request.student.user.email ?? '',
      display_name: data.display_name,
      phone: data.phone ?? '',
    } });
  });

  app.get('/api/student/consents', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const { data, error } = await request.student.client
      .from('student_consents')
      .select('id, organization, purpose, data_categories, version, status, requested_at, decided_at, withdrawal_allowed')
      .eq('student_id', request.student.user.id)
      .order('requested_at', { ascending: false });
    if (error) return sendError(response, 502, 'CONSENTS_UNAVAILABLE', 'Consent requests are temporarily unavailable.');
    return response.json({ data: { consents: data ?? [] } });
  });

  app.post('/api/student/consents/:consentId/decision', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const decision = request.body?.decision;
    if (!['grant', 'decline', 'withdraw'].includes(decision)) {
      return sendError(response, 400, 'INVALID_CONSENT_DECISION', 'Choose grant, decline, or withdraw.');
    }
    const rpcDecision = decision === 'grant' ? 'granted' : decision === 'decline' ? 'declined' : 'withdrawn';
    const { data, error } = await request.student.client.rpc('decide_student_consent', {
      p_consent_id: request.params.consentId,
      p_decision: rpcDecision,
    });
    if (error) {
      const message = String(error.message ?? '').toLowerCase();
      if (message.includes('not found')) return sendError(response, 404, 'CONSENT_NOT_FOUND', 'This consent request was not found.');
      if (message.includes('does not belong')) return sendError(response, 404, 'CONSENT_NOT_FOUND', 'This consent request was not found on your account.');
      if (message.includes('cannot be withdrawn') || message.includes('already recorded')) return sendError(response, 409, 'INVALID_CONSENT_STATE', 'This consent decision cannot be changed.');
      return sendError(response, 502, 'CONSENT_UPDATE_FAILED', 'The consent decision could not be saved.');
    }
    return response.json({ data: { consent: data } });
  });

  app.get('/api/student/activity', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const query = request.student.client
      .from('student_activity')
      .select('id, event_type, description, status_from, status_to, actor_id, actor_label, occurred_at')
      .eq('student_id', request.student.user.id);
    if (typeof request.query.event_type === 'string') query.eq?.('event_type', request.query.event_type);
    const { data, error } = await query.order('occurred_at', { ascending: false });
    if (error) return sendError(response, 502, 'ACTIVITY_UNAVAILABLE', 'Activity history is temporarily unavailable.');
    return response.json({ data: { activity: data ?? [] } });
  });

  app.get('/api/student/notifications', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const [notificationQuery, settingsQuery] = await Promise.all([
      request.student.client.from('student_notifications').select('id, category, title, message, source_type, read_at, created_at').eq('student_id', request.student.user.id).order('created_at', { ascending: false }),
      request.student.client.from('student_settings').select('enrollment_notifications, consent_notifications, verification_notifications, credential_notifications').eq('student_id', request.student.user.id).maybeSingle(),
    ]);
    if (notificationQuery.error) return sendError(response, 502, 'NOTIFICATIONS_UNAVAILABLE', 'Notifications are temporarily unavailable.');
    const preferences = settingsQuery.data ?? {};
    const enabled = {
      enrollment: preferences.enrollment_notifications !== false,
      consent: preferences.consent_notifications !== false,
      verification: preferences.verification_notifications !== false,
      credential: preferences.credential_notifications !== false,
    };
    const notifications = (notificationQuery.data ?? []).filter((notification) => enabled[String(notification.category).toLowerCase()] !== false);
    return response.json({ data: { notifications } });
  });

  app.patch('/api/student/notifications/:notificationId/read', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const { data, error } = await request.student.client.rpc('mark_student_notification_read', {
      p_notification_id: request.params.notificationId,
    });
    if (error) {
      const message = String(error.message ?? '').toLowerCase();
      if (message.includes('not found') || message.includes('does not belong')) return sendError(response, 404, 'NOTIFICATION_NOT_FOUND', 'This notification was not found on your account.');
      return sendError(response, 502, 'NOTIFICATION_UPDATE_FAILED', 'The notification could not be marked as read.');
    }
    return response.json({ data: { notification: data } });
  });

  app.get('/api/student/credentials', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const { data, error } = await request.student.client
      .from('student_credentials')
      .select('id, title, issuer, unique_identifier, verification_reference, issued_at, valid_from, valid_until, status, revoked_at, details')
      .eq('student_id', request.student.user.id)
      .order('issued_at', { ascending: false });
    if (error) return sendError(response, 502, 'CREDENTIALS_UNAVAILABLE', 'Credentials are temporarily unavailable.');
    return response.json({ data: { credentials: data ?? [] } });
  });

  app.get('/api/student/verifications', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const { data, error } = await request.student.client
      .from('student_verifications')
      .select('id, credential_id, record_reference, requesting_organization, disclosure_allowed, requested_at, completed_at, outcome, status')
      .eq('student_id', request.student.user.id)
      .order('requested_at', { ascending: false });
    if (error) return sendError(response, 502, 'VERIFICATIONS_UNAVAILABLE', 'Verification history is temporarily unavailable.');
    const disclosed = (data ?? []).map((record) => ({
      ...record,
      requesting_organization: record.disclosure_allowed ? record.requesting_organization : null,
    }));
    return response.json({ data: { verifications: disclosed } });
  });

  app.get('/api/public/credentials/:reference', async (request, response) => {
    const reference = request.params.reference;
    if (!/^[-_A-Za-z0-9]{16,128}$/.test(reference)) return sendError(response, 404, 'CREDENTIAL_NOT_FOUND', 'No credential matches this verification reference.');
    const publicClient = makeClient();
    const { data, error } = await publicClient.rpc('verify_candidate_credential', { p_reference: reference });
    if (error) return sendError(response, 502, 'VERIFICATION_UNAVAILABLE', 'The credential could not be verified.');
    if (!data || data.status === 'invalid') return sendError(response, 404, 'CREDENTIAL_NOT_FOUND', 'No credential matches this verification reference.');
    return response.json({ data: { credential: data } });
  });

  app.post('/api/student/enrollments/:enrollmentId/decision', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const { decision, rejection_reason = null } = request.body ?? {};
    if (!['confirm', 'reject'].includes(decision)) {
      return sendError(response, 400, 'INVALID_DECISION', 'Choose confirm or reject.');
    }
    if (decision === 'reject' && rejection_reason !== null && (typeof rejection_reason !== 'string' || rejection_reason.length > 500)) {
      return sendError(response, 400, 'VALIDATION_ERROR', 'The rejection reason must be 500 characters or fewer.');
    }

    const normalizedReason = decision === 'reject' && typeof rejection_reason === 'string'
      ? rejection_reason.trim() || null
      : null;
    const { data, error } = await request.student.client.rpc('decide_student_enrollment', {
      p_enrollment_id: request.params.enrollmentId,
      p_decision: decision,
      p_rejection_reason: normalizedReason,
    });

    if (error) {
      const message = String(error.message ?? '').toLowerCase();
      if (message.includes('not found') || message.includes('does not belong')) {
        return sendError(response, 404, 'ENROLLMENT_NOT_FOUND', 'This enrollment offer was not found on your account.');
      }
      if (message.includes('cannot make this decision') || message.includes('already been recorded')) {
        return sendError(response, 409, 'INVALID_ENROLLMENT_STATE', 'This enrollment is no longer awaiting your decision.');
      }
      if (message.includes('rejection reason')) {
        return sendError(response, 400, 'VALIDATION_ERROR', 'The rejection reason must be 500 characters or fewer.');
      }
      logger.error('Student enrollment decision failed', error);
      return sendError(response, 502, 'DECISION_FAILED', 'Your enrollment decision could not be saved.');
    }

    return response.json({ data: { enrollment: data } });
  });

  app.get('/api/student/enrollments', (request, response, next) => authenticate(request, response, next), async (request, response) => {
    const { data, error } = await request.student.client
      .from('student_enrollments')
      .select(enrollmentColumns)
      .eq('student_id', request.student.user.id)
      .order('submitted_at', { ascending: false });
    if (error) {
      logger.error('Student enrollment read failed', error);
      return sendError(response, 502, 'ENROLLMENTS_UNAVAILABLE', 'Enrollment information is temporarily unavailable.');
    }

    return response.json({ data: { enrollments: data ?? [] } });
  });

  app.use('/api', (_request, response) => sendError(response, 404, 'NOT_FOUND', 'API route not found.'));
  app.use((error, _request, response, next) => {
    if (response.headersSent) return next(error);
    logger.error('Candidate API request failed', error);
    const malformedJson = error instanceof SyntaxError && 'body' in error;
    return sendError(
      response,
      malformedJson ? 400 : 500,
      malformedJson ? 'INVALID_JSON' : 'INTERNAL_ERROR',
      malformedJson ? 'Request body must be valid JSON.' : 'The candidate request could not be completed.',
    );
  });
  return app;
}
