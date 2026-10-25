import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FileCheck2,
  FileClock,
  Flag,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  ActivityTimeline,
  Brand,
  DataTable,
  EmptyState,
  FormField,
  Notice,
  PageHeader,
  QRPlaceholder,
  SearchBar,
  SectionHeader,
  SelectField,
  Tabs,
  StatCard,
  StatusBadge,
} from './components';
import { demoActivity, demoRecords, roleDetails, routeInfo } from './data/demo';
import type { DemoRecord, Role } from './types';

const publicNav = [
  { label: 'About', href: '/about' },
  { label: 'Security', href: '/security' },
];

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link to="/" aria-label="Sudharshan home"><Brand /></Link>
        <button className="public-header__menu icon-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} type="button"><span className="sr-only">Menu</span><ChevronRight size={18} /></button>
        <nav className={menuOpen ? 'public-nav public-nav--open' : 'public-nav'} aria-label="Public navigation">
          {publicNav.map((item, index) => <Link key={`${item.label}-${index}`} to={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
          <Link className="button button--small button--primary public-nav__login" to="/login">Login <ArrowRight size={15} /></Link>
        </nav>
      </div>
    </header>
  );
}

function PublicPageFrame({ children }: { children: ReactNode }) {
  return <div className="public-site"><PublicHeader />{children}</div>;
}

export function AboutPage() {
  return <PublicPageFrame><main className="public-content content-container"><PageHeader eyebrow="ABOUT THE CONCEPT" title="A shared view of student enrolment records." description="A prototype information architecture for institutions, students, AICTE and authorized verifiers." />
    <div className="prose-layout"><div className="prose-main"><h2>Why this platform concept</h2><p>SIH26263 explores an APAAR-ID-based approach to student data management and verification for AICTE-approved institutions. The concept places institutional submission, student confirmation and review within one understandable record journey.</p><p>APAAR is the intended primary student identity in the architecture. This interface does not connect to APAAR or any production identity service.</p><h2>Participants in the record journey</h2><ul><li><strong>Institutions</strong> prepare and submit student enrolment records.</li><li><strong>Students</strong> review the information presented about their record and confirm details in a future phase.</li><li><strong>AICTE</strong> has a structured oversight and review view.</li><li><strong>Authorized verifiers</strong> are intended to verify consented, relevant information.</li></ul></div><aside className="prose-aside"><p className="eyebrow">PROTOTYPE BOUNDARY</p><h3>Interface, not integration.</h3><p>No authentication, APAAR connection, student verification, college submission, database, or external service is operational here.</p><Link to="/prototype/access" className="text-link">View prototype roles <ArrowRight size={15} /></Link></aside></div>
  </main></PublicPageFrame>;
}

export function SecurityPage() {
  return <PublicPageFrame><main className="public-content content-container"><PageHeader eyebrow="INTENDED PRINCIPLES" title="A careful approach to student information." description="The points below describe design intent for future development. They are not claims that the prototype has operational security controls or legal compliance." />
    <div className="principle-list">{[
      ['01', 'Data minimization', 'Collect and present only the information needed for a defined purpose.'],
      ['02', 'Controlled access', 'Plan role-aware views and appropriate handling for sensitive operations.'],
      ['03', 'Consent and purpose', 'Make the purpose of information sharing understandable and account for consent where required.'],
      ['04', 'Auditability', 'Design future activity records so relevant actions can be reviewed.'],
      ['05', 'Secure verification', 'Keep sensitive processing and external services behind a backend, not in browser code.'],
    ].map(([number, title, text]) => <article key={number}><span className="principle-list__index">{number}</span><h2>{title}</h2><p>{text}</p></article>)}</div>
    <Notice tone="warning" label="Prototype boundary">No security, privacy-compliance or production-readiness claim is made. Authentication, authorization, consent, data controls, audit trails and verification are not implemented.</Notice>
  </main></PublicPageFrame>;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate('/prototype/access');
  }
  return <PublicPageFrame><main className="login-page content-container"><div className="login-card"><div className="login-card__identity"><Brand /><span className="prototype-tag">PROTOTYPE ACCESS</span></div><p className="eyebrow">INSTITUTIONAL PLATFORM</p><h1>Sign in to continue</h1><p className="login-card__intro">Choose the appropriate portal. This prototype does not validate credentials.</p>
      <form className="login-form" onSubmit={handleSubmit}>
        <SelectField label="Portal" name="portal" options={[{ label: 'Select a role', value: '' }, { label: 'AICTE', value: 'aicte' }, { label: 'College Official', value: 'college' }, { label: 'Candidate / Student', value: 'student' }]} />
        <FormField label="Email or user ID" name="identity" autoComplete="username" required hint="For this prototype, no account details are needed." />
        <FormField label="Password" name="password" type="password" autoComplete="current-password" required />
        <button type="button" className="text-link login-forgot" onClick={() => setMessage('Password recovery is not available in this prototype.')}>Forgot password?</button>
        {message && <p className="inline-feedback" role="status">{message}</p>}
        <button type="submit" className="button button--primary button--full">Login <ArrowRight size={16} /></button>
      </form>
      <div className="login-divider"><span>OR</span></div>
      <Link className="button button--secondary button--full" to="/prototype/access">Login as Guest <ArrowRight size={16} /></Link>
      <p className="login-card__boundary"><LockKeyhole size={14} /> Prototype access. No production authentication is connected.</p>
    </div><div className="login-side"><p className="eyebrow">APAAR-BASED RECORDS</p><h2>A clearer record of enrolment, confirmation and review.</h2><p>Explore the interface through synthetic records. No real student or identity data is used.</p><div className="login-side__reference"><span>PLATFORM REFERENCE</span><code>SIH26263 / DEMO</code></div></div></main></PublicPageFrame>;
}

export function RoleAccessPage() {
  const roles: Array<{ role: Role; icon: typeof Building2 }> = [
    { role: 'aicte', icon: Building2 },
    { role: 'college', icon: GraduationCap },
    { role: 'student', icon: UserRound },
  ];
  return <PublicPageFrame><main className="access-page content-container"><div className="access-heading"><p className="eyebrow">PROTOTYPE ENTRY</p><h1>Choose your prototype role</h1><p>Explore the proposed information architecture through a role-specific interface.</p></div>
    <Notice label="Prototype access">Prototype access. No production authentication is connected.</Notice>
    <div className="role-card-list">{roles.map(({ role, icon: Icon }, index) => <Link key={role} className="role-card" to={`/${role}`}><span className="role-card__index">0{index + 1}</span><span className="role-card__icon"><Icon size={21} strokeWidth={1.7} /></span><span className="role-card__body"><strong>{roleDetails[role].label}</strong><span>{roleDetails[role].summary}</span></span><span className="role-card__arrow"><ArrowRight size={18} /></span></Link>)}</div>
    <p className="access-footnote">Each option opens a simulation. Data shown in role dashboards is synthetic demo content.</p>
  </main></PublicPageFrame>;
}

const legalContent = {
  privacy: {
    title: 'Privacy Policy',
    description: 'Draft structure for a future privacy notice. This prototype does not collect or store student records through its interface.',
    sections: [
      ['Information and purpose', 'Future content should describe which information is handled, why it is needed, and how purpose limitation is applied.'],
      ['Access and control', 'Future content should explain access, correction, consent where required, and consent withdrawal mechanisms.'],
      ['Retention and security', 'Future content should set out retention periods, security measures, auditability, and grievance contacts.'],
      ['Third parties', 'Future content should identify any third-party services and clarify their purposes and data handling.'],
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'Draft prototype content only. Terms for a deployed service have not been prepared.',
    sections: [
      ['Prototype use', 'This site demonstrates a user interface only. It does not provide production enrolment, verification or credential services.'],
      ['Information shown', 'Examples are synthetic and do not represent actual students, institutions or official records.'],
      ['Future terms', 'Any future terms should define permitted use, responsibilities, support, dispute and grievance processes.'],
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'Draft placeholder. This prototype does not add application cookie tracking or analytics.',
    sections: [
      ['Current prototype', 'The application does not implement analytics or cookie tracking. Hosting infrastructure may apply its own technical processes.'],
      ['Future disclosure', 'A future policy should describe any cookies or storage, their purpose, duration, and controls.'],
    ],
  },
} as const;

export function LegalPage({ kind }: { kind: keyof typeof legalContent }) {
  const content = legalContent[kind];
  return <PublicPageFrame><main className="public-content content-container"><PageHeader eyebrow="DRAFT / PROTOTYPE CONTENT" title={content.title} description={content.description} /><Notice tone="warning" label="Draft page">This placeholder is not legal advice and does not represent an adopted policy or compliance claim.</Notice><div className="legal-sections">{content.sections.map(([title, text], index) => <section key={title}><span className="principle-list__index">{String(index + 1).padStart(2, '0')}</span><div><h2>{title}</h2><p>{text}</p></div></section>)}</div></main></PublicPageFrame>;
}

export function ContactPage() {
  return <PublicPageFrame><main className="public-content content-container"><PageHeader eyebrow="CONTACT" title="Contact details will be added later." description="This prototype does not send messages or connect to an email service." /><EmptyState title="Contact channel not connected" description="A contact and grievance mechanism is part of future implementation planning. No message can be sent from this page." /></main></PublicPageFrame>;
}

function toneForStatus(status: DemoRecord['status']) {
  if (status === 'Awaiting confirmation') return 'warning' as const;
  if (status === 'Ready for review') return 'success' as const;
  return 'info' as const;
}

function RecordsTable({ role }: { role: Role }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All examples');
  const rows = useMemo(() => demoRecords.filter((record) => (activeTab !== 'In review' || record.status === 'Validation review') && `${record.reference} ${record.programme} ${record.workflow} ${record.status}`.toLowerCase().includes(query.toLowerCase())), [activeTab, query]);
  const tableRows = rows.map((record) => ({
    rowKey: record.reference,
    reference: <code className="record-code">{record.reference}</code>,
    programme: record.programme,
    workflow: record.workflow,
    status: <StatusBadge tone={toneForStatus(record.status)}>{record.status}</StatusBadge>,
    updated: record.updated,
  }));
  const columns = [
    { key: 'reference', label: 'Synthetic reference' },
    { key: 'programme', label: 'Programme' },
    { key: 'workflow', label: 'Workflow stage' },
    { key: 'status', label: 'Illustrative status' },
    { key: 'updated', label: 'Demo date' },
  ];
  const roleCaption = role === 'student' ? 'Example academic record' : 'Synthetic student record examples';
  return <><Notice label="Demo Data">These rows are synthetic examples. Search filters only the examples displayed in this browser; no records are submitted or changed.</Notice><div className="table-panel"><div className="table-panel__head"><Tabs items={['All examples', 'In review']} active={activeTab} onChange={setActiveTab} /><SearchBar value={query} onChange={setQuery} /></div><DataTable columns={columns} rows={tableRows} caption={roleCaption} /></div><p className="table-footnote">Reference IDs and workflow states are illustrative, not production records.</p></>;
}

function WorkflowStrip({ role }: { role: Role }) {
  const steps = role === 'college' ? ['Student data', 'Validation', 'Student confirmation', 'Submission', 'Monitoring'] : ['Submit', 'Validate', 'Confirm', 'Review', 'Verify'];
  return <ol className="workflow-strip">{steps.map((step, index) => <li key={step} className={index === 0 ? 'workflow-strip__current' : ''}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong>{index < steps.length - 1 && <ChevronRight aria-hidden="true" />}</li>)}</ol>;
}

function AicteDashboard() {
  return <><PageHeader eyebrow="AICTE · PROTOTYPE ROLE" title="Oversight dashboard" description="An interface foundation for structured monitoring and review. All content on this page is synthetic." actions={<StatusBadge tone="info">Demo Data</StatusBadge>} />
    <Notice label="Prototype dashboard">No official AICTE metrics, live institution feeds or student verification services are connected.</Notice>
    <div className="stats-grid"><StatCard label="Submission overview" value="Illustrative" detail="Sample workflow states only" icon={FileCheck2} /><StatCard label="Validation overview" value="Not connected" detail="Rule checks are planned for a later phase" icon={ClipboardCheck} /><StatCard label="Review queue" value="Preview only" detail="Official queue is not connected" icon={FileClock} /><StatCard label="Risk overview" value="Not active" detail="Risk analysis is not implemented" icon={Flag} /></div>
    <div className="dashboard-columns"><section className="panel"><SectionHeader title="Illustrative record stages" description="A concept view of the future oversight flow." /><WorkflowStrip role="aicte" /><div className="panel-link-row"><Link className="text-link" to="/aicte/students">View synthetic examples <ArrowRight size={15} /></Link><span className="micro-label">NO LIVE DATA</span></div></section><section className="panel"><SectionHeader title="Recent demo activity" description="Sample events, not an audit trail." /><ActivityTimeline items={demoActivity.slice(0, 2)} /></section></div>
    <section className="panel dashboard-table"><SectionHeader title="Records requiring attention" description="Illustrative references for the future review interface." action={<Link to="/aicte/warnings" className="text-link">Open warnings <ArrowRight size={14} /></Link>} /><DataTable caption="Synthetic records for review" columns={[{ key: 'reference', label: 'Synthetic reference' }, { key: 'programme', label: 'Programme' }, { key: 'workflow', label: 'Workflow stage' }, { key: 'status', label: 'Example status' }]} rows={demoRecords.slice(0, 2).map((record) => ({ rowKey: record.reference, reference: <code className="record-code">{record.reference}</code>, programme: record.programme, workflow: record.workflow, status: <StatusBadge tone={toneForStatus(record.status)}>{record.status}</StatusBadge> }))} /></section>
  </>;
}

function CollegeDashboard() {
  return <><PageHeader eyebrow="COLLEGE OFFICIAL · PROTOTYPE ROLE" title="Institution workspace" description="A proposed workflow view for student data, confirmation and review." actions={<StatusBadge tone="info">Demo Data</StatusBadge>} />
    <Notice label="Synthetic examples">This dashboard uses fictional references and sample workflow states. No institution or student records are connected.</Notice>
    <section className="panel workflow-panel"><SectionHeader title="Institution-side workflow" description="The intended path from record preparation to monitoring." /><WorkflowStrip role="college" /></section>
    <div className="stats-grid stats-grid--three"><StatCard label="Student data" value="Example records" detail="Synthetic only" icon={GraduationCap} /><StatCard label="Validation" value="Not connected" detail="No rules are run in this prototype" icon={ClipboardCheck} /><StatCard label="Student confirmation" value="Planned" detail="No requests or notifications are sent" icon={UserRound} /></div>
    <section className="panel dashboard-table"><SectionHeader title="Student record examples" description="APAAR-centric interface direction with synthetic IDs only." action={<Link to="/college/students" className="text-link">View records <ArrowRight size={14} /></Link>} /><RecordsTable role="college" /></section>
  </>;
}

function StudentDashboard() {
  return <><PageHeader eyebrow="CANDIDATE / STUDENT · PROTOTYPE ROLE" title="Your record overview" description="A clear view of the information and confirmation status a future service could present." actions={<StatusBadge tone="info">Prototype</StatusBadge>} />
    <Notice label="Synthetic profile">This is a demonstration view only. It is not connected to your identity or any real student record.</Notice>
    <div className="student-record-banner"><div className="student-record-banner__identity"><span className="student-record-banner__avatar"><UserRound size={23} /></span><div><span className="eyebrow">SYNTHETIC STUDENT REFERENCE</span><h2>Candidate example</h2><code>APAAR-DEMO-0000</code></div></div><StatusBadge tone="warning">Confirmation pending · illustrative</StatusBadge></div>
    <div className="stats-grid stats-grid--three"><StatCard label="Academic record" value="Example shown" detail="Synthetic academic entry" icon={BookOpen} /><StatCard label="Institution submission" value="Illustrative" detail="No record was submitted" icon={Building2} /><StatCard label="Verification status" value="Illustrative" detail="No identity check is performed" icon={ShieldCheck} /></div>
    <div className="dashboard-columns student-dashboard-columns"><section className="panel"><SectionHeader title="What is shown here" description="Sample views for a future student portal." /><ul className="student-checklist"><li><Check /> Academic record example <span>Demo</span></li><li><CircleHelp /> Confirmation state <span>Illustrative</span></li><li><FileClock /> Data activity <span>Not connected</span></li><li><ShieldCheck /> Consent history <span>Not stored</span></li></ul><Link to="/student/academic-record" className="text-link">View academic record <ArrowRight size={15} /></Link></section><section className="panel"><SectionHeader title="Example data activity" description="No actual events are recorded." /><ActivityTimeline items={demoActivity.slice(0, 2)} /><Link to="/student/activity" className="text-link">View activity page <ArrowRight size={15} /></Link></section></div>
  </>;
}

function RoleDashboard({ role }: { role: Role }) {
  if (role === 'aicte') return <AicteDashboard />;
  if (role === 'college') return <CollegeDashboard />;
  return <StudentDashboard />;
}

export function RolePage({ role }: { role: Role }) {
  const location = useLocation();
  const path = location.pathname.replace(/\/$/, '') || '/';
  const page = routeInfo[path];
  if (!page || page.role !== role) return <NotFoundPage path={path} />;
  if (path === `/${role}`) return <RoleDashboard role={role} />;
  if (path === '/aicte/students' || path === '/college/students' || path === '/student/academic-record') {
    return <><PageHeader eyebrow={`${roleDetails[role].label.toUpperCase()} · DEMO DATA`} title={page.title} description={page.description} /><RecordsTable role={role} /></>;
  }
  if (path === '/student/qr' || path === '/college/credentials') {
    return <><PageHeader eyebrow={`${roleDetails[role].label.toUpperCase()} · PROTOTYPE`} title={page.title} description={page.description} /><div className="qr-panel panel"><QrCard /><Notice label="Not issued">No QR credential or signed verification token is generated here.</Notice></div></>;
  }
  if (path === '/student/activity' || path === '/college/activity' || path === '/aicte/audit') {
    return <><PageHeader eyebrow={`${roleDetails[role].label.toUpperCase()} · PROTOTYPE`} title={page.title} description={page.description} /><Notice label="Demo events only">These illustrative events are not a production audit trail and no activity is being recorded.</Notice><div className="panel timeline-panel"><ActivityTimeline items={demoActivity} /></div></>;
  }
  if (path === '/student/verification' || path === '/aicte/verification') {
    return <><PageHeader eyebrow="VERIFICATION · PROTOTYPE" title={page.title} description={page.description} /><div className="verification-panel panel"><span className="verification-panel__icon"><ShieldCheck size={25} /></span><div><h2>Verification is not connected</h2><p>This screen shows where a future consent-based verification status may appear. No identity data is checked or shared.</p></div><StatusBadge tone="neutral">Not active</StatusBadge></div></>;
  }
  if (path === '/student/consent') {
    return <><PageHeader eyebrow="CONSENT · PROTOTYPE" title={page.title} description={page.description} /><Notice tone="warning" label="No consent is stored">Consent controls and withdrawal are planned for a future phase. Nothing can be granted or changed here.</Notice><div className="panel consent-panel"><h2>Example information sharing</h2><p>A future interface should clearly explain the recipient, purpose, information requested and duration before a student gives or withdraws consent.</p><div className="consent-example"><span>Recipient</span><strong>Authorized verifier · example</strong><span>Purpose</span><strong>Enrolment status check · example</strong><span>Information</span><strong>Minimum relevant record · planned</strong></div></div></>;
  }
  return <PlaceholderPage title={page.title} description={page.description} role={role} />;
}

function QrCard() {
  return <div className="qr-card"><QRPlaceholder /><div><p className="eyebrow">CREDENTIAL PREVIEW</p><h2>No credential available</h2><p>This area is reserved for a future consent-based QR or signed credential flow. It is not scannable.</p></div></div>;
}

export function PlaceholderPage({ title, description, role }: { title: string; description: string; role: Role }) {
  return <><PageHeader eyebrow={`${roleDetails[role].label.toUpperCase()} · PLANNED AREA`} title={title} description={description} /><div className="planned-panel"><div className="planned-panel__index"><span>PHASE</span><strong>02</strong></div><div><p className="eyebrow">COMING IN NEXT IMPLEMENTATION PHASE</p><h2>This workflow is not active yet.</h2><p>The current build provides the navigation and page structure only. No information is saved, submitted, verified or sent from this page.</p><Link to="/about" className="text-link">Review the prototype scope <ArrowRight size={15} /></Link></div></div></>;
}

export function NotFoundPage({ path }: { path: string }) {
  return <div className="not-found-page"><Brand /><p className="eyebrow">PAGE NOT FOUND</p><h1>This route is not part of the prototype.</h1><p>The address <code>{path}</code> does not match an available page.</p><div className="not-found__actions"><Link className="button button--primary" to="/">Return to home <ArrowRight size={16} /></Link><button className="button button--secondary" onClick={() => window.history.back()} type="button">Go back</button></div></div>;
}
