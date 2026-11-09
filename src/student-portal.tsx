import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Bell, Building2, CalendarClock, Clock3, LockKeyhole, LogOut, RefreshCw, Save, Settings, UserRound } from 'lucide-react';
import QRCode from 'qrcode';
import { Link, useParams } from 'react-router-dom';
import { Brand, EmptyState, Modal, Notice, PageHeader, SectionHeader, StatusBadge } from './components';
import { ApiServiceError, apiService } from './services/api';

type StudentUser = { id: string; email: string; lastSignInAt?: string | null; createdAt?: string | null; emailConfirmed?: boolean };
type StudentConsent = { id: string; organization: string; purpose: string; data_categories: string[]; version: string; status: string; requested_at: string; decided_at: string | null; withdrawal_allowed: boolean };
type StudentActivity = { id: string; event_type: string; description: string; status_from: string | null; status_to: string | null; actor_id: string | null; actor_label: string | null; occurred_at: string };
type StudentNotification = { id: string; category: string; title: string; message: string; source_type: string | null; read_at: string | null; created_at: string };
type StudentVerification = { id: string; credential_id: string | null; record_reference: string; requesting_organization: string | null; disclosure_allowed: boolean; requested_at: string; completed_at: string | null; outcome: string; status: string };
type StudentCredential = { id: string; title: string; issuer: string; unique_identifier: string; verification_reference: string; issued_at: string; valid_from: string; valid_until: string | null; status: string; revoked_at: string | null; details: string | null };
type PublicCredential = { verified: boolean; status: string; title: string; issuer: string; issued_at: string; valid_from: string; valid_until: string | null };
type StudentSettings = { theme: 'system' | 'light' | 'dark'; enrollment_notifications: boolean; consent_notifications: boolean; verification_notifications: boolean; credential_notifications: boolean; updated_at: string | null };
type StudentProfile = { email: string; display_name: string; phone: string };
type StudentEnrollment = {
  id: string;
  reference: string;
  program: string;
  institution: string;
  submitted_at: string;
  status: string;
  deadline: string | null;
  terms: string | null;
  candidate_decision_at: string | null;
  candidate_rejection_reason: string | null;
};

async function loadSettings() {
  return (await apiService.get<{ settings: StudentSettings }>('/api/student/settings')).data.settings;
}

async function loadProfile() {
  return (await apiService.get<StudentProfile>('/api/student/profile')).data;
}

async function loadEnrollments() {
  return (await apiService.get<{ enrollments: StudentEnrollment[] }>('/api/student/enrollments')).data.enrollments;
}

async function loadConsents() {
  return (await apiService.get<{ consents: StudentConsent[] }>('/api/student/consents')).data.consents;
}

async function loadActivity() {
  return (await apiService.get<{ activity: StudentActivity[] }>('/api/student/activity')).data.activity;
}

async function loadNotifications() {
  return (await apiService.get<{ notifications: StudentNotification[] }>('/api/student/notifications')).data.notifications;
}

async function loadVerifications() {
  return (await apiService.get<{ verifications: StudentVerification[] }>('/api/student/verifications')).data.verifications;
}

async function loadCredentials() {
  return (await apiService.get<{ credentials: StudentCredential[] }>('/api/student/credentials')).data.credentials;
}

async function loadTransparencyTimeline() {
  const [activity, enrollments, consents] = await Promise.all([loadActivity(), loadEnrollments(), loadConsents()]);
  return { activity, enrollments, consents };
}

function errorMessage(error: unknown) {
  if (error instanceof ApiServiceError) return error.message;
  return 'The candidate service is unavailable. Try again when it is reachable.';
}

function useCandidateResource<T>(loader: () => Promise<T>) {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: session } = await apiService.get<{ user: StudentUser | null }>('/api/student/session');
      setUser(session.user);
      if (!session.user) {
        setData(null);
        return;
      }
      setData(await loader());
    } catch (loadError) {
      setError(errorMessage(loadError));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => { void refresh(); }, [refresh]);
  return { user, data, loading, error, setData, setError, refresh };
}

export function StudentDashboardPage() {
  const portal = useCandidateResource(async () => {
    const [profile, enrollments, activity, notifications, verifications, consents] = await Promise.all([loadProfile(), loadEnrollments(), loadActivity(), loadNotifications(), loadVerifications(), loadConsents()]);
    return { profile, enrollments, activity, notifications, verifications, consents };
  });
  const data = portal.data;
  const shortcuts = [
    ['/student/profile', 'Profile', UserRound], ['/student/academic-record', 'Enrollments', Building2], ['/student/consent', 'Consent', LockKeyhole], ['/student/activity', 'Activity', Clock3], ['/student/verification-history', 'Verifications', RefreshCw], ['/student/qr', 'Credentials', Save], ['/student/notifications', 'Notifications', Bell], ['/student/settings', 'Settings', Settings],
  ] as const;
  const pendingEnrollments = data?.enrollments.filter((item) => ['awaiting candidate', 'awaiting_candidate', 'awaiting confirmation'].includes(item.status.toLowerCase().replace(/[_-]+/g, ' '))) ?? [];
  const pendingConsents = data?.consents.filter((item) => item.status === 'pending') ?? [];
  const unread = data?.notifications.filter((item) => !item.read_at) ?? [];

  return <div className="student-module student-dashboard">
    <PageHeader eyebrow="CANDIDATE / STUDENT" title={data ? `Welcome${data.profile.display_name ? `, ${data.profile.display_name}` : ''}` : 'Candidate dashboard'} description="Review your profile, enrollment journey, permissions and recent account activity." />
    <ModuleState loading={portal.loading} error={portal.error} onRetry={portal.refresh} user={portal.user} onSignedIn={portal.refresh}>
      {data && <>
        <section className="panel student-dashboard__summary"><SectionHeader title="Candidate profile" description="Your authenticated account summary" /><dl className="student-dashboard__details"><div><dt>Name</dt><dd>{data.profile.display_name || 'Not provided'}</dd></div><div><dt>Email</dt><dd>{portal.user?.email ?? data.profile.email}</dd></div><div><dt>Phone</dt><dd>{data.profile.phone || 'Not provided'}</dd></div></dl><Link to="/student/profile" className="text-link">View profile <ArrowRight size={15} /></Link></section>
        <div className="student-dashboard__status-grid"><section className="panel"><SectionHeader title="Enrollment status" description="Current candidate records" />{data.enrollments.length ? <><StatusBadge tone={statusTone(data.enrollments[0].status)}>{data.enrollments[0].status.replace(/_/g, ' ')}</StatusBadge><p>{data.enrollments[0].program} · {data.enrollments[0].institution}</p></> : <EmptyState title="No enrollment records" description="No enrollment records are associated with this account." />}<Link to="/student/academic-record" className="text-link">View enrollments <ArrowRight size={15} /></Link></section>
        <section className="panel"><SectionHeader title="Pending actions" description="Items requiring candidate attention" />{pendingEnrollments.length || pendingConsents.length ? <ul className="student-dashboard__actions">{pendingEnrollments.map((item) => <li key={item.id}><Link to="/student/academic-record">Review enrollment {item.reference}</Link></li>)}{pendingConsents.map((item) => <li key={item.id}><Link to="/student/consent">Review consent from {item.organization}</Link></li>)}</ul> : <EmptyState title="No pending actions" description="There are no outstanding candidate actions." />}</section>
        <section className="panel"><SectionHeader title="Verification status" description="Latest authorized verification" />{data.verifications.length ? <><StatusBadge tone={statusTone(data.verifications[0].status)}>{data.verifications[0].status}</StatusBadge><p>{data.verifications[0].record_reference}</p></> : <EmptyState title="No verification records" description="No verification outcomes are recorded." />}<Link to="/student/verification-history" className="text-link">View history <ArrowRight size={15} /></Link></section></div>
        <div className="student-dashboard__status-grid"><section className="panel"><SectionHeader title="Notifications" description={`${unread.length} unread`} />{unread.length ? <>{unread.slice(0, 3).map((item) => <p key={item.id}><strong>{item.title}</strong><br />{dateLabel(item.created_at)}</p>)}</> : <EmptyState title="No unread notifications" description="You are up to date." />}<Link to="/student/notifications" className="text-link">Open notifications <ArrowRight size={15} /></Link></section>
        <section className="panel"><SectionHeader title="Recent activity" description="Latest persisted account events" />{data.activity.length ? data.activity.slice(0, 3).map((item) => <p key={item.id}><strong>{item.description}</strong><br /><span>{dateLabel(item.occurred_at)}</span></p>) : <EmptyState title="No recent activity" description="No account activity has been recorded." />}<Link to="/student/activity" className="text-link">View activity <ArrowRight size={15} /></Link></section></div>
        <section className="panel"><SectionHeader title="Portal shortcuts" description="Open candidate services" /><nav className="student-dashboard__shortcuts">{shortcuts.map(([path, label, Icon]) => <Link key={path} to={path}><Icon size={16} /><span>{label}</span><ArrowRight size={14} /></Link>)}</nav></section>
      </>}
    </ModuleState>
  </div>;
}
function CandidateSignIn({ onSignedIn }: { onSignedIn: () => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await apiService.post<{ email: string; password: string }, { user: StudentUser }>(
        '/api/student/session',
        { email, password },
      );
      await onSignedIn();
    } catch (signInError) {
      setError(errorMessage(signInError));
    } finally {
      setSubmitting(false);
    }
  }

  return <section className="panel student-module__signin">
    <span className="student-module__signin-icon"><LockKeyhole size={19} /></span>
    <h2>Sign in to your candidate account</h2>
    <p>Use the candidate account provided by your institution. This portal does not create accounts.</p>
    <form className="student-module__form" onSubmit={handleSubmit}>
      <label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {error && <p className="student-module__error" role="alert">{error}</p>}
      <button className="button button--primary" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'} <ArrowRight size={15} /></button>
    </form>
  </section>;
}

function PortalSignOut({ onSignedOut }: { onSignedOut: () => Promise<void> }) {
  const [error, setError] = useState('');
  async function signOut() {
    setError('');
    try {
      await apiService.delete<{ signedOut: boolean }>('/api/student/session');
      await onSignedOut();
    } catch (signOutError) {
      setError(errorMessage(signOutError));
    }
  }
  return <div className="student-module__account-actions">
    {error && <span className="student-module__error" role="alert">{error}</span>}
    <button className="button button--secondary button--small" onClick={signOut} type="button"><LogOut size={14} /> Sign out</button>
  </div>;
}

function ModuleState({
  loading,
  error,
  onRetry,
  user,
  onSignedIn,
  children,
}: {
  loading: boolean;
  error: string;
  onRetry: () => Promise<void>;
  user: StudentUser | null;
  onSignedIn: () => Promise<void>;
  children: ReactNode;
}) {
  if (loading) return <div className="panel student-module__state" role="status"><RefreshCw size={17} /> Loading candidate information…</div>;
  if (error && !user) return <div className="panel student-module__state student-module__state--error"><p role="alert">{error}</p><button className="button button--secondary button--small" onClick={() => void onRetry()} type="button">Retry</button></div>;
  if (!user) return <CandidateSignIn onSignedIn={onSignedIn} />;
  if (error) return <div className="panel student-module__state student-module__state--error"><p role="alert">{error}</p><button className="button button--secondary button--small" onClick={() => void onRetry()} type="button">Retry</button></div>;
  return <>{children}</>;
}

export function StudentProfilePage() {
  const portal = useCandidateResource(loadProfile);
  const profile = portal.data;
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name);
    setPhone(profile.phone);
  }, [profile]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage('');
    setSaveError('');
    const validationErrors: Record<string, string> = {};
    const normalizedName = displayName.trim();
    const normalizedPhone = phone.trim();
    const digitCount = normalizedPhone.replace(/\D/g, '').length;
    if (!normalizedName || normalizedName.length > 100) {
      validationErrors.display_name = 'Enter a name between 1 and 100 characters.';
    }
    if (normalizedPhone && (!/^\+?[0-9][0-9 ()-]{5,30}$/.test(normalizedPhone) || digitCount < 7 || digitCount > 15)) {
      validationErrors.phone = 'Enter a valid phone number with 7 to 15 digits.';
    }
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSaving(true);
    try {
      const { data } = await apiService.patch<{ display_name: string; phone: string }, StudentProfile>(
        '/api/student/profile',
        { display_name: normalizedName, phone: normalizedPhone },
      );
      portal.setData(data);
      setSaveMessage('Your profile changes have been saved.');
    } catch (saveError) {
      if (saveError instanceof ApiServiceError && saveError.fieldErrors) setFieldErrors(saveError.fieldErrors);
      else setSaveError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return <div className="student-module">
    <PageHeader eyebrow="CANDIDATE / STUDENT" title="My profile" description="Review and update the profile details you are permitted to change." />
    <Notice label="Protected fields">Your account email is read-only. APAAR and institution-verified fields are not editable in this portal.</Notice>
    <ModuleState loading={portal.loading} error={portal.error} onRetry={portal.refresh} user={portal.user} onSignedIn={portal.refresh}>
      {profile && <section className="panel student-module__profile">
        <SectionHeader title="Candidate details" description="Only your display name and phone number can be edited." />
        <form className="student-module__form" onSubmit={saveProfile}>
          <label>Email address<span className="student-module__readonly"><LockKeyhole size={14} /> Read only</span><input type="email" value={profile.email} readOnly aria-readonly="true" /></label>
          <label htmlFor="candidate-display-name">Display name<input id="candidate-display-name" name="display_name" autoComplete="name" maxLength={100} required value={displayName} aria-invalid={Boolean(fieldErrors.display_name)} aria-describedby={fieldErrors.display_name ? 'candidate-display-name-error' : undefined} onChange={(event) => setDisplayName(event.target.value)} />{fieldErrors.display_name && <span className="student-module__error" id="candidate-display-name-error">{fieldErrors.display_name}</span>}</label>
          <label htmlFor="candidate-phone">Phone number <span className="student-module__optional">Optional</span><input id="candidate-phone" name="phone" type="tel" autoComplete="tel" maxLength={32} value={phone} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'candidate-phone-error' : undefined} onChange={(event) => setPhone(event.target.value)} />{fieldErrors.phone && <span className="student-module__error" id="candidate-phone-error">{fieldErrors.phone}</span>}</label>
          {portal.error && <p className="student-module__error" role="alert">{portal.error}</p>}
          {saveError && <p className="student-module__error" role="alert">{saveError}</p>}
          {saveMessage && <p className="student-module__success" role="status">{saveMessage}</p>}
          <div className="student-module__form-actions"><button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'} <Save size={15} /></button><PortalSignOut onSignedOut={portal.refresh} /></div>
        </form>
      </section>}
    </ModuleState>
  </div>;
}

function dateLabel(value: string | null) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not provided' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const normalized = status.toLowerCase();
  if (['approved', 'confirmed', 'candidate confirmed', 'candidate_confirmed', 'complete', 'completed'].includes(normalized)) return 'success';
  if (['rejected', 'candidate rejected', 'candidate_rejected', 'withdrawn', 'cancelled'].includes(normalized)) return 'danger';
  if (['awaiting confirmation', 'pending', 'awaiting_candidate'].includes(normalized)) return 'warning';
  if (['submitted', 'under review', 'under_review', 'in review'].includes(normalized)) return 'info';
  return 'neutral';
}

export function StudentEnrollmentsPage() {
  const portal = useCandidateResource(loadEnrollments);
  const enrollments = portal.data ?? [];
  const [decisionEnrollment, setDecisionEnrollment] = useState<StudentEnrollment | null>(null);
  const [decision, setDecision] = useState<'confirm' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState('');
  const [decisionSuccess, setDecisionSuccess] = useState('');

  async function submitDecision() {
    if (!decisionEnrollment || !decision || submitting) return;
    if (decision === 'reject' && rejectionReason.trim().length > 500) {
      setDecisionError('The rejection reason must be 500 characters or fewer.');
      return;
    }
    setSubmitting(true);
    setDecisionError('');
    try {
      const { data } = await apiService.post<{ decision: 'confirm' | 'reject'; rejection_reason?: string }, { enrollment: StudentEnrollment }>(
        `/api/student/enrollments/${decisionEnrollment.id}/decision`,
        { decision, ...(decision === 'reject' ? { rejection_reason: rejectionReason.trim() } : {}) },
      );
      const updated = data.enrollment;
      portal.setData(enrollments.map((enrollment) => enrollment.id === updated.id ? updated : enrollment));
      setDecisionSuccess(decision === 'confirm' ? 'Enrollment confirmed. The institution must complete its approval.' : 'Enrollment rejected and recorded for the institution.');
      setDecisionEnrollment(null);
      setDecision(null);
      setRejectionReason('');
    } catch (error) {
      setDecisionError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function openDecision(enrollment: StudentEnrollment, selectedDecision: 'confirm' | 'reject') {
    setDecisionEnrollment(enrollment);
    setDecision(selectedDecision);
    setRejectionReason('');
    setDecisionError('');
    setDecisionSuccess('');
  }

  return <div className="student-module">
    <PageHeader eyebrow="CANDIDATE / STUDENT" title="Enrollment details" description="Review enrollment offers and respond only where your institution has opened the confirmation step." />
    {decisionSuccess && <p className="student-module__decision-success" role="status">{decisionSuccess}</p>}
    <ModuleState loading={portal.loading} error={portal.error} onRetry={portal.refresh} user={portal.user} onSignedIn={portal.refresh}>
      {portal.user && <section className="student-module__enrollments">
        <SectionHeader title="Your enrollments" description={`${enrollments.length} ${enrollments.length === 1 ? 'record' : 'records'} associated with your account.`} />
        {enrollments.length ? <div className="student-module__enrollment-list">{enrollments.map((enrollment) => {
          const normalizedStatus = enrollment.status.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
          const pendingDecision = ['awaiting candidate', 'awaiting confirmation'].includes(normalizedStatus);
          return <article className="panel student-module__enrollment" key={enrollment.id}>
            <div className="student-module__enrollment-head"><div><span className="eyebrow">ENROLLMENT REFERENCE</span><h2>{enrollment.reference}</h2></div><StatusBadge tone={statusTone(enrollment.status)}>{enrollment.status}</StatusBadge></div>
            <dl className="student-module__enrollment-details">
              <div><dt><Building2 size={14} /> Program</dt><dd>{enrollment.program}</dd></div>
              <div><dt><Building2 size={14} /> Institution</dt><dd>{enrollment.institution}</dd></div>
              <div><dt><CalendarClock size={14} /> Submitted</dt><dd>{dateLabel(enrollment.submitted_at)}</dd></div>
              <div><dt><Clock3 size={14} /> Deadline</dt><dd>{dateLabel(enrollment.deadline)}</dd></div>
            </dl>
            <div className="student-module__terms"><span>Offer terms</span><p>{enrollment.terms?.trim() || 'The institution has not provided additional terms for this enrollment offer.'}</p></div>
            {pendingDecision ? <div className="student-module__decision-actions">
              <button className="button button--primary" type="button" onClick={() => openDecision(enrollment, 'confirm')}>Confirm Enrollment</button>
              <button className="button button--secondary" type="button" onClick={() => openDecision(enrollment, 'reject')}>Reject Enrollment</button>
            </div> : enrollment.candidate_decision_at ? <div className="student-module__decision-record">
              <Clock3 size={15} /> Decision recorded {dateLabel(enrollment.candidate_decision_at)}
              {enrollment.candidate_rejection_reason && <span>Reason: {enrollment.candidate_rejection_reason}</span>}
            </div> : null}
          </article>;
        })}</div> : <div className="panel"><EmptyState title="No enrollment records yet" description="No enrollment has been associated with this candidate account. Contact your institution if you expected a record." /></div>}
      </section>}
    </ModuleState>
    <Link to="/student" className="text-link"><ArrowRight size={15} /> Return to candidate dashboard</Link>

    <Modal open={Boolean(decisionEnrollment && decision)} title={decision === 'confirm' ? 'Confirm enrollment?' : 'Reject enrollment?'} onClose={() => { if (!submitting) { setDecisionEnrollment(null); setDecision(null); setDecisionError(''); } }}>
      <p>{decision === 'confirm'
        ? `Confirm your enrollment in ${decisionEnrollment?.program} at ${decisionEnrollment?.institution}? This records your candidate decision; the institution still must approve the enrollment.`
        : `Reject your enrollment offer from ${decisionEnrollment?.institution}? The institution will be able to review this decision.`}</p>
      {decision === 'reject' && <label className="student-module__rejection-label">Rejection reason <span>(optional)</span><textarea maxLength={500} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} /></label>}
      {decisionError && <p className="student-module__error" role="alert">{decisionError}</p>}
      <div className="modal-panel__actions"><button className="button button--secondary" type="button" disabled={submitting} onClick={() => { setDecisionEnrollment(null); setDecision(null); }}>Cancel</button><button className="button button--primary" type="button" disabled={submitting} onClick={() => void submitDecision()}>{submitting ? 'Saving…' : decision === 'confirm' ? 'Confirm Enrollment' : 'Reject Enrollment'}</button></div>
    </Modal>
  </div>;
}

export function StudentConsentsPage() {
  const portal = useCandidateResource(loadConsents);
  const consents = portal.data ?? [];
  const [selected, setSelected] = useState<{ consent: StudentConsent; decision: 'grant' | 'decline' | 'withdraw' } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');

  async function submitDecision() {
    if (!selected || submitting) return;
    setSubmitting(true);
    setActionError('');
    try {
      const { data } = await apiService.post<{ decision: 'grant' | 'decline' | 'withdraw' }, { consent: StudentConsent }>(
        `/api/student/consents/${selected.consent.id}/decision`,
        { decision: selected.decision },
      );
      portal.setData(consents.map((consent) => consent.id === data.consent.id ? data.consent : consent));
      setMessage(selected.decision === 'withdraw' ? 'Consent withdrawal has been recorded.' : selected.decision === 'grant' ? 'Consent has been granted.' : 'The consent request has been declined.');
      setSelected(null);
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="student-module">
    <PageHeader eyebrow="CANDIDATE / STUDENT" title="Consent management" description="Review what organizations request and make explicit consent decisions for your data." />
    {message && <p className="student-module__decision-success" role="status">{message}</p>}
    <ModuleState loading={portal.loading} error={portal.error} onRetry={portal.refresh} user={portal.user} onSignedIn={portal.refresh}>
      <section className="student-module__consents">
        <SectionHeader title="Consent requests" description="Missing or pending consent is never treated as granted." />
        {consents.length ? <div className="student-module__consent-list">{consents.map((consent) => {
          const status = consent.status.toLowerCase();
          return <article className="panel student-module__consent" key={consent.id}>
            <div className="student-module__consent-head"><div><span className="eyebrow">REQUESTING ORGANIZATION</span><h2>{consent.organization}</h2></div><StatusBadge tone={status === 'granted' ? 'success' : status === 'pending' ? 'warning' : status === 'declined' ? 'danger' : 'neutral'}>{status}</StatusBadge></div>
            <p className="student-module__consent-purpose">{consent.purpose}</p>
            <dl className="student-module__consent-details"><div><dt>Data requested</dt><dd>{consent.data_categories?.length ? consent.data_categories.join(', ') : 'No data categories specified'}</dd></div><div><dt>Consent version</dt><dd>{consent.version}</dd></div><div><dt>Requested</dt><dd>{dateLabel(consent.requested_at)}</dd></div><div><dt>Decision</dt><dd>{consent.decided_at ? dateLabel(consent.decided_at) : 'No decision recorded'}</dd></div></dl>
            <div className="student-module__consent-actions">
              {status === 'pending' && <><button className="button button--primary button--small" type="button" onClick={() => { setSelected({ consent, decision: 'grant' }); setActionError(''); setMessage(''); }}>Grant consent</button><button className="button button--secondary button--small" type="button" onClick={() => { setSelected({ consent, decision: 'decline' }); setActionError(''); setMessage(''); }}>Decline</button></>}
              {status === 'granted' && consent.withdrawal_allowed && <button className="button button--secondary button--small" type="button" onClick={() => { setSelected({ consent, decision: 'withdraw' }); setActionError(''); setMessage(''); }}>Withdraw consent</button>}
            </div>
          </article>;
        })}</div> : <div className="panel"><EmptyState title="No consent requests" description="There are no consent requests associated with your candidate account." /></div>}
      </section>
    </ModuleState>
    <Link to="/student" className="text-link"><ArrowRight size={15} /> Return to candidate dashboard</Link>
    <Modal open={Boolean(selected)} title={selected?.decision === 'grant' ? 'Grant consent?' : selected?.decision === 'withdraw' ? 'Withdraw consent?' : 'Decline consent?'} onClose={() => { if (!submitting) { setSelected(null); setActionError(''); } }}>
      <p>{selected?.decision === 'grant' ? `Grant ${selected.consent.organization} permission for: ${selected.consent.purpose}` : selected?.decision === 'withdraw' ? `Withdraw the consent granted to ${selected?.consent.organization}?` : `Decline the consent requested by ${selected?.consent.organization}?`}</p>
      {actionError && <p className="student-module__error" role="alert">{actionError}</p>}
      <div className="modal-panel__actions"><button className="button button--secondary" type="button" disabled={submitting} onClick={() => setSelected(null)}>Cancel</button><button className="button button--primary" type="button" disabled={submitting} onClick={() => void submitDecision()}>{submitting ? 'Saving…' : selected?.decision === 'grant' ? 'Grant consent' : selected?.decision === 'withdraw' ? 'Withdraw consent' : 'Decline consent'}</button></div>
    </Modal>
  </div>;
}

export function StudentActivityPage() {
  const portal = useCandidateResource(loadActivity);
  const activity = portal.data ?? [];
  const [eventType, setEventType] = useState('all');
  const eventTypes = Array.from(new Set(activity.map((item) => item.event_type))).sort();
  const visibleActivity = eventType === 'all' ? activity : activity.filter((item) => item.event_type === eventType);

  function formatActivityDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not provided' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  return <div className="student-module">
    <PageHeader eyebrow="CANDIDATE / STUDENT" title="Data activity" description="Review changes and decisions recorded for your candidate account." />
    <ModuleState loading={portal.loading} error={portal.error} onRetry={portal.refresh} user={portal.user} onSignedIn={portal.refresh}>
      <section className="student-module__activity">
        <div className="student-module__activity-toolbar"><SectionHeader title="Activity history" description="Newest entries appear first." /><label>Event type<select value={eventType} onChange={(event) => setEventType(event.target.value)}><option value="all">All activity</option>{eventTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}</select></label></div>
        {visibleActivity.length ? <div className="panel student-module__activity-list">{visibleActivity.map((item) => <article className="student-module__activity-item" key={item.id}><div className="student-module__activity-marker" /><div><span className="student-module__activity-type">{item.event_type.replace(/_/g, ' ')}</span><h2>{item.description}</h2>{(item.status_from || item.status_to) && <p className="student-module__activity-change">{item.status_from ?? 'No status'} <ArrowRight size={13} /> {item.status_to ?? 'No status'}</p>}<p className="student-module__activity-meta"><Clock3 size={13} /> {formatActivityDate(item.occurred_at)}{item.actor_label && <> · {item.actor_label}</>}</p></div></article>)}</div> : <div className="panel"><EmptyState title={activity.length ? 'No matching activity' : 'No activity recorded'} description={activity.length ? 'Choose another event type to see more history.' : 'There are no permitted activity records for your candidate account yet.'} /></div>}
      </section>
    </ModuleState>
    <Link to="/student" className="text-link"><ArrowRight size={15} /> Return to candidate dashboard</Link>
  </div>;
}

export function StudentTransparencyPage() {
  const portal = useCandidateResource(loadTransparencyTimeline);
  const timeline = portal.data;
  const recorded = timeline?.activity ?? [];
  const enrollments = timeline?.enrollments ?? [];
  const consents = timeline?.consents ?? [];
  const pending = [
    ...enrollments.filter((enrollment) => ['awaiting candidate', 'awaiting confirmation'].includes(enrollment.status.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim())).map((enrollment) => ({ id: `pending-enrollment-${enrollment.id}`, title: `Candidate decision for ${enrollment.program}`, detail: enrollment.reference, actor: enrollment.institution })),
    ...consents.filter((consent) => consent.status === 'pending').map((consent) => ({ id: `pending-consent-${consent.id}`, title: `Consent decision required: ${consent.organization}`, detail: consent.purpose, actor: consent.organization })),
  ];

  return <div className="student-module">
    <PageHeader eyebrow="CANDIDATE / STUDENT" title="Transparency timeline" description="See recorded lifecycle events and actions that are still pending." />
    <ModuleState loading={portal.loading} error={portal.error} onRetry={portal.refresh} user={portal.user} onSignedIn={portal.refresh}>
      <section className="student-module__transparency">
        {recorded.length || pending.length ? <div className="panel student-module__timeline-list">
          {recorded.map((item) => <article className="student-module__timeline-item student-module__timeline-item--recorded" key={item.id}><div className="student-module__timeline-marker" /><div><span className="student-module__timeline-kind">Recorded event</span><h2>{item.description}</h2>{item.status_from && item.status_to && <p>{item.status_from} → {item.status_to}</p>}<p className="student-module__activity-meta"><Clock3 size={13} /> {formatActivityDate(item.occurred_at)}{item.actor_label && <> · {item.actor_label}</>}</p></div></article>)}
          {pending.map((item) => <article className="student-module__timeline-item student-module__timeline-item--pending" key={item.id}><div className="student-module__timeline-marker" /><div><span className="student-module__timeline-kind">Pending action</span><h2>{item.title}</h2><p>{item.detail}</p><p className="student-module__activity-meta"><Building2 size={13} /> {item.actor}</p></div></article>)}
        </div> : <div className="panel"><EmptyState title="No lifecycle history yet" description="Recorded enrollment, credential, or consent events will appear here." /></div>}
      </section>
    </ModuleState>
    <Link to="/student" className="text-link"><ArrowRight size={15} /> Return to candidate dashboard</Link>
  </div>;

  function formatActivityDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not provided' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }
}

export function StudentVerificationHistoryPage() {
  const portal = useCandidateResource(loadVerifications);
  const verifications = portal.data ?? [];

  return <div className="student-module">
    <PageHeader eyebrow="CANDIDATE / STUDENT" title="Verification history" description="Authorized verification outcomes recorded for your candidate account." />
    <ModuleState loading={portal.loading} error={portal.error} onRetry={portal.refresh} user={portal.user} onSignedIn={portal.refresh}>
      {verifications.length ? <div className="student-module__verification-list">{verifications.map((record) => <article className="panel student-module__verification" key={record.id}><div className="student-module__verification-head"><div><span className="eyebrow">RECORD REFERENCE</span><h2>{record.record_reference}</h2></div><StatusBadge tone={statusTone(record.status)}>{record.status}</StatusBadge></div><dl className="student-module__consent-details"><div><dt>Requested</dt><dd>{dateLabel(record.requested_at)}</dd></div><div><dt>Completed</dt><dd>{record.completed_at ? dateLabel(record.completed_at) : 'Pending completion'}</dd></div><div><dt>Outcome</dt><dd>{record.outcome}</dd></div><div><dt>Organization</dt><dd>{record.requesting_organization ?? (record.disclosure_allowed ? 'Not disclosed' : 'Disclosure not permitted')}</dd></div></dl>{record.credential_id && <Link className="text-link student-module__credential-link" to="/student/qr">View associated credential <ArrowRight size={15} /></Link>}</article>)}</div> : <div className="panel"><EmptyState title="No verification history" description="No authorized verification records have been associated with your account." /></div>}
    </ModuleState>
    <Link to="/student" className="text-link"><ArrowRight size={15} /> Return to candidate dashboard</Link>
  </div>;
}

export function StudentCredentialsPage() {
  const portal = useCandidateResource(loadCredentials);
  const credentials = portal.data ?? [];
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    void Promise.all(credentials.map(async (credential) => [credential.id, await QRCode.toDataURL(`${window.location.origin}/verify/${credential.verification_reference}`, { width: 220, margin: 1 })])).then((entries) => {
      if (active) setQrImages(Object.fromEntries(entries as [string, string][]));
    }).catch(() => { if (active) setQrImages({}); });
    return () => { active = false; };
  }, [credentials]);

  function effectiveStatus(credential: StudentCredential) {
    if (credential.revoked_at || credential.status === 'revoked') return 'revoked';
    if (credential.status === 'unverifiable') return 'unverifiable';
    if (credential.valid_until && new Date(credential.valid_until).getTime() < Date.now()) return 'expired';
    return credential.status;
  }

  return <div className="student-module">
    <PageHeader eyebrow="CANDIDATE / STUDENT" title="My credentials" description="Credentials issued by authorities are displayed with their server-backed verification reference." />
    <ModuleState loading={portal.loading} error={portal.error} onRetry={portal.refresh} user={portal.user} onSignedIn={portal.refresh}>
      {credentials.length ? <div className="student-module__credentials">{credentials.map((credential) => {
        const status = effectiveStatus(credential);
        return <article className="panel student-module__credential" key={credential.id}><div className="student-module__credential-layout"><div><div className="student-module__enrollment-head"><div><span className="eyebrow">ISSUER</span><h2>{credential.title}</h2></div><StatusBadge tone={status === 'valid' ? 'success' : status === 'expired' ? 'warning' : status === 'revoked' ? 'warning' : 'neutral'}>{status}</StatusBadge></div><dl className="student-module__enrollment-details"><div><dt>Issuer</dt><dd>{credential.issuer}</dd></div><div><dt>Unique identifier</dt><dd>{credential.unique_identifier}</dd></div><div><dt>Issued</dt><dd>{dateLabel(credential.issued_at)}</dd></div><div><dt>Valid until</dt><dd>{dateLabel(credential.valid_until)}</dd></div></dl>{credential.details && <p className="student-module__credential-details">{credential.details}</p>}<button className="button button--secondary button--small" type="button" onClick={() => window.print()}>Print credential</button></div>{qrImages[credential.id] ? <div className="student-module__qr"><a href={`/verify/${credential.verification_reference}`} aria-label={`Open public verification for ${credential.title}`}><img src={qrImages[credential.id]} alt={`Verification QR for ${credential.title}`} /><span>Scan to verify</span></a><a className="text-link" href={qrImages[credential.id]} download={`${credential.unique_identifier}-verification.png`}>Download QR</a></div> : <span className="student-module__qr-loading">Generating QR…</span>}</div></article>;
      })}</div> : <div className="panel"><EmptyState title="No credentials issued" description="Credentials genuinely issued by an authorized issuer will appear here." /></div>}
    </ModuleState>
    <Link to="/student" className="text-link"><ArrowRight size={15} /> Return to candidate dashboard</Link>
  </div>;
}

export function StudentSettingsPage() {
  const portal = useCandidateResource(loadSettings);
  const settings = portal.data;
  const [draft, setDraft] = useState<StudentSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => { if (settings && !draft) setDraft(settings); }, [settings, draft]);
  useEffect(() => {
    if (!settings) return;
    document.documentElement.dataset.candidateTheme = settings.theme;
    return () => { delete document.documentElement.dataset.candidateTheme; };
  }, [settings]);

  async function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true); setSuccess(''); setActionError('');
    try {
      const { data } = await apiService.put<StudentSettings, { settings: StudentSettings }>('/api/student/settings', draft);
      portal.setData(data.settings);
      setDraft(data.settings);
      setSuccess('Preferences saved.');
    } catch (error) { setActionError(errorMessage(error)); }
    finally { setSaving(false); }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(''); setActionError('');
    if (newPassword !== confirmPassword) { setActionError('The new password and confirmation do not match.'); return; }
    if (newPassword.length < 8 || newPassword.length > 72) { setActionError('Use a password between 8 and 72 characters.'); return; }
    if (newPassword === currentPassword) { setActionError('New password must be different from the current password.'); return; }
    setChangingPassword(true);
    try {
      await apiService.patch<{ current_password: string; new_password: string }, { passwordChanged: boolean }>('/api/student/password', { current_password: currentPassword, new_password: newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setSuccess('Password changed successfully.');
    } catch (error) { setActionError(errorMessage(error)); }
    finally { setChangingPassword(false); }
  }

  const notifications: Array<[keyof Pick<StudentSettings, 'enrollment_notifications' | 'consent_notifications' | 'verification_notifications' | 'credential_notifications'>, string]> = [
    ['enrollment_notifications', 'Enrollment updates'], ['consent_notifications', 'Consent requests and decisions'], ['verification_notifications', 'Verification outcomes'], ['credential_notifications', 'Credential updates'],
  ];

  return <div className="student-module">
    <PageHeader eyebrow="CANDIDATE / STUDENT" title="Settings" description="Manage candidate preferences and account security." />
    <ModuleState loading={portal.loading} error={portal.error} onRetry={portal.refresh} user={portal.user} onSignedIn={portal.refresh}>
      {draft && <div className="student-settings"><form className="panel student-settings__section" onSubmit={savePreferences}><SectionHeader title="Preferences" description="Preferences apply only to this candidate account." /><label className="student-settings__theme">Theme<select value={draft.theme} onChange={(event) => setDraft({ ...draft, theme: event.target.value as StudentSettings['theme'] })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><fieldset className="student-settings__notifications"><legend>In-app notification preferences</legend>{notifications.map(([key, label]) => <label key={key}><input type="checkbox" checked={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.checked })} /><span>{label}</span></label>)}</fieldset><button className="button button--primary button--small" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save preferences'} <Save size={15} /></button></form>
      <section className="panel student-settings__section"><SectionHeader title="Account security" description="Protected account details are read-only here." /><dl className="student-module__enrollment-details"><div><dt>Email</dt><dd>{portal.user?.email ?? 'Not available'}</dd></div><div><dt>Email status</dt><dd>{portal.user?.emailConfirmed ? 'Confirmed' : 'Confirmation status unavailable'}</dd></div><div><dt>Last sign-in</dt><dd>{portal.user?.lastSignInAt ? dateLabel(portal.user.lastSignInAt) : 'Not available'}</dd></div><div><dt>Account created</dt><dd>{portal.user?.createdAt ? dateLabel(portal.user.createdAt) : 'Not available'}</dd></div></dl></section>
      <form className="panel student-settings__section" onSubmit={changePassword}><SectionHeader title="Change password" description="Your current password is required and protected account details cannot be changed here." /><div className="student-settings__passwords"><label>Current password<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label><label>New password<input type="password" autoComplete="new-password" minLength={8} maxLength={72} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label><label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} maxLength={72} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label></div><button className="button button--secondary button--small" type="submit" disabled={changingPassword}>{changingPassword ? 'Changing…' : 'Change password'}</button></form></div>}
      {success && <p className="student-module__success" role="status">{success}</p>}{actionError && <p className="student-module__error" role="alert">{actionError}</p>}
    </ModuleState>
    <Link to="/student" className="text-link"><ArrowRight size={15} /> Return to candidate dashboard</Link>
  </div>;
}

export function PublicCredentialVerificationPage() {
  const { reference = '' } = useParams();
  const [credential, setCredential] = useState<PublicCredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    void apiService.get<{ credential: PublicCredential }>(`/api/public/credentials/${encodeURIComponent(reference)}`)
      .then(({ data }) => { if (active) setCredential(data.credential); })
      .catch((reason) => { if (active) { setCredential(null); setError(errorMessage(reason)); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reference]);

  return <main className="public-verification content-container">
    <div className="public-verification__brand"><Brand /></div>
    <PageHeader eyebrow="PUBLIC CREDENTIAL CHECK" title="Credential verification" description="Verification is performed against the platform's authoritative credential record." />
    {loading ? <div className="panel public-verification__state">Checking credential…</div> : error ? <Notice tone="warning" label="Verification unavailable">{error}</Notice> : credential ? <section className={`panel public-verification__result public-verification__result--${credential.status}`}><div className="public-verification__heading"><div><span className="eyebrow">VERIFIED CREDENTIAL</span><h2>{credential.title}</h2></div><StatusBadge tone={credential.status === 'valid' ? 'success' : credential.status === 'expired' ? 'warning' : credential.status === 'revoked' ? 'warning' : 'neutral'}>{credential.status}</StatusBadge></div><dl><div><dt>Issuer</dt><dd>{credential.issuer}</dd></div><div><dt>Issued</dt><dd>{dateLabel(credential.issued_at)}</dd></div><div><dt>Valid from</dt><dd>{dateLabel(credential.valid_from)}</dd></div><div><dt>Valid until</dt><dd>{dateLabel(credential.valid_until)}</dd></div></dl><p>{credential.verified ? 'This credential is currently valid.' : `This credential is ${credential.status} and should not be treated as a current, valid credential.`}</p></section> : null}
  </main>;
}

export function StudentNotificationsPage() {
  const portal = useCandidateResource(loadNotifications);
  const notifications = portal.data ?? [];
  const [category, setCategory] = useState('all');
  const [updatingId, setUpdatingId] = useState('');
  const [actionError, setActionError] = useState('');
  const categories = Array.from(new Set(notifications.map((item) => item.category))).sort();
  const visible = notifications.filter((item) => category === 'all' || item.category === category);

  async function markRead(id: string) {
    setUpdatingId(id);
    setActionError('');
    try {
      const { data } = await apiService.patch<Record<string, never>, { notification: StudentNotification }>(`/api/student/notifications/${id}/read`, {});
      portal.setData(notifications.map((item) => item.id === data.notification.id ? data.notification : item));
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setUpdatingId('');
    }
  }

  return <div className="student-module">
    <PageHeader eyebrow="CANDIDATE / STUDENT" title="Notifications" description="Updates persisted for your candidate account. No email, SMS, or push delivery is implied." />
    <ModuleState loading={portal.loading} error={portal.error} onRetry={portal.refresh} user={portal.user} onSignedIn={portal.refresh}>
      <section className="student-module__notifications">
        <div className="student-module__activity-toolbar"><SectionHeader title="Your updates" description={`${notifications.filter((item) => !item.read_at).length} unread`} /><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>)}</select></label></div>
        {actionError && <p className="student-module__error" role="alert">{actionError}</p>}
        {visible.length ? <div className="student-module__notification-list">{visible.map((item) => <article className={`panel student-module__notification ${item.read_at ? '' : 'student-module__notification--unread'}`} key={item.id}><div><span className="student-module__notification-category">{item.category.replace(/_/g, ' ')}</span><h2>{item.title}</h2><p>{item.message}</p><span className="student-module__activity-meta"><Clock3 size={13} /> {formatNotificationDate(item.created_at)}</span></div>{!item.read_at && <button className="button button--secondary button--small" type="button" disabled={updatingId === item.id} onClick={() => void markRead(item.id)}>{updatingId === item.id ? 'Saving…' : 'Mark as read'}</button>}</article>)}</div> : <div className="panel"><EmptyState title={notifications.length ? 'No matching notifications' : 'No notifications yet'} description={notifications.length ? 'Choose another category to view updates.' : 'Relevant enrollment, consent, verification, and credential updates will appear here.'} /></div>}
      </section>
    </ModuleState>
    <Link to="/student" className="text-link"><ArrowRight size={15} /> Return to candidate dashboard</Link>
  </div>;

  function formatNotificationDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not provided' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }
}
