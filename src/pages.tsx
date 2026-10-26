import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FileCheck2,
  FileClock,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  Flag,
  GraduationCap,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Upload,
  UserRound,
  Users,
} from 'lucide-react';
import {
  ActivityTimeline,
  Brand,
  DataTable,
  EmptyState,
  FormField,
  Modal,
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
import { collegeService, useCollegeData, type AddStudentInput } from './services/collegeStore';
import type { CollegeStudent, DemoRecord, Role, SeatAllocation } from './types';

const publicNav = [
  { label: 'Platform', href: '/#platform' },
  { label: 'About', href: '/about' },
  { label: 'Security', href: '/security' },
];

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link to="/" aria-label="APAAR Record home"><Brand /></Link>
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

export function LandingPage() {
  return (
    <PublicPageFrame>
      <main>
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-mark" /> SIH26263 · CONCEPT PROTOTYPE</p>
              <h1>APAAR-based Student Data Management <em>&amp;</em> Verification Platform</h1>
              <p className="hero-lede">A structured way for institutions to submit student records, for students to confirm enrolment, and for AICTE to monitor, review and verify information.</p>
              <div className="hero-actions"><Link to="/login" className="button button--primary">Enter the platform <ArrowRight size={16} /></Link><Link to="/about" className="text-link">Explore the concept <ArrowRight size={15} /></Link></div>
              <p className="hero-footnote"><LockKeyhole size={14} aria-hidden="true" /> Prototype only. No live APAAR connection or production authentication.</p>
            </div>
            <div className="hero-register" aria-label="Illustrative enrolment record workflow">
              <div className="hero-register__header"><span>RECORD PATHWAY</span><span className="micro-label">ILLUSTRATIVE</span></div>
              <div className="hero-register__title"><div className="hero-register__mark"><Brand compact /></div><div><span>STUDENT RECORD</span><strong>APAAR-centred by design</strong></div></div>
              <ol className="record-steps">
                <li className="record-step record-step--complete"><span className="record-step__icon"><Building2 size={16} /></span><div><strong>Institution</strong><span>Submits enrolment record</span></div><span className="record-step__state">01</span></li>
                <li className="record-step record-step--current"><span className="record-step__icon"><UserRound size={16} /></span><div><strong>Student</strong><span>Reviews and confirms</span></div><span className="record-step__state">02</span></li>
                <li className="record-step"><span className="record-step__icon"><ShieldCheck size={16} /></span><div><strong>AICTE</strong><span>Monitors and reviews</span></div><span className="record-step__state">03</span></li>
                <li className="record-step"><span className="record-step__icon"><BadgeCheck size={16} /></span><div><strong>Authorized verifier</strong><span>Checks consented information</span></div><span className="record-step__state">04</span></li>
              </ol>
              <div className="hero-register__footer"><span>REFERENCE</span><code>DEMO-RECORD-000</code><span className="hero-register__demo"><span /> DEMO DATA</span></div>
            </div>
          </div>
        </section>

        <section className="participant-strip" aria-label="Platform participants"><div className="content-container participant-strip__inner"><span className="section-kicker">A SHARED RECORD JOURNEY</span><div><span>Institution</span><ChevronRight /><span>Student</span><ChevronRight /><span>AICTE</span><ChevronRight /><span>Authorized Verifier</span></div></div></section>

        <section className="content-section content-container" id="platform">
          <div className="section-intro"><p className="eyebrow">THE PLATFORM CONCEPT</p><h2>More clarity at each step of the record.</h2><p>Student information moves through an understandable path, from institution submission to student confirmation and authorized review.</p></div>
          <div className="pillar-grid">
            <article className="pillar"><span className="pillar__index">01 / VALIDATION</span><div className="pillar__icon"><ClipboardCheck size={20} /></div><h3>Structured records</h3><p>Consistent student data and rule-based checks help establish a reviewable starting point.</p><span className="future-label">Anomaly and duplicate detection planned later</span></article>
            <article className="pillar"><span className="pillar__index">02 / TRANSPARENCY</span><div className="pillar__icon"><BookOpen size={20} /></div><h3>Student confirmation</h3><p>Students can see the status of submitted information and understand relevant activity.</p><span className="future-label">Confirmation and activity history planned</span></article>
            <article className="pillar"><span className="pillar__index">03 / VERIFICATION</span><div className="pillar__icon"><BadgeCheck size={20} /></div><h3>Controlled verification</h3><p>Authorized checks are intended to reveal only the information needed for a stated purpose.</p><span className="future-label">Consent and signed credentials planned later</span></article>
          </div>
        </section>

        <section className="workflow-band">
          <div className="content-container workflow-band__inner"><div className="workflow-band__heading"><p className="eyebrow">A CLEAR SEQUENCE</p><h2>How the concept works</h2><p>Five steps, with student confirmation between institutional submission and review.</p></div>
            <ol className="workflow-list">{['Submit', 'Validate', 'Confirm', 'Review', 'Verify'].map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong>{index < 4 && <ChevronRight aria-hidden="true" />}</li>)}</ol>
          </div>
        </section>

        <section className="content-section content-container privacy-section"><div className="privacy-section__mark"><ShieldCheck size={26} strokeWidth={1.6} /></div><div className="privacy-section__copy"><p className="eyebrow">PRIVACY BY DESIGN INTENT</p><h2>Information should be visible for a reason.</h2><p>The future platform is intended to follow data minimization, controlled access, consent where required, auditability and privacy-aware handling. Those safeguards are not implemented in this prototype.</p><Link className="text-link" to="/security">Read the intended principles <ArrowRight size={15} /></Link></div><div className="privacy-section__list"><span><Check /> Data minimization</span><span><Check /> Purpose and consent</span><span><Check /> Controlled access</span><span><Check /> Auditability</span></div></section>

        <section className="closing-band"><div className="content-container closing-band__inner"><div><p className="eyebrow">EXPLORE THE INTERFACE</p><h2>See the workflow from each participant’s view.</h2></div><Link to="/prototype/access" className="button button--light">Choose a prototype role <ArrowRight size={16} /></Link></div></section>
      </main>
    </PublicPageFrame>
  );
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
  const [selectedTab, setSelectedTab] = useState<'All' | 'Flagged' | 'Pending' | 'Clean'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStudent, setActiveStudent] = useState<CollegeStudent | null>(null);

  const { profile, metrics, seatAllocations, activity: recentActivity, getStudents } = useCollegeData();

  const tabFilterMap = {
    All: 'all',
    Flagged: 'flagged',
    Pending: 'pending',
    Clean: 'clean',
  } as const;

  const students = useMemo(() => {
    return getStudents({
      tab: tabFilterMap[selectedTab],
      query: searchQuery,
    });
  }, [getStudents, selectedTab, searchQuery]);

  const seatColumns = [
    { key: 'programme', label: 'Programme & Branch' },
    { key: 'code', label: 'AICTE Code' },
    { key: 'approvedIntake', label: 'Approved Intake' },
    { key: 'enrolled', label: 'Enrolled' },
    { key: 'vacant', label: 'Vacant' },
    {
      key: 'utilization',
      label: 'Intake Capacity',
      render: (row: Record<string, ReactNode>) => {
        const item = row as unknown as SeatAllocation;
        const pct = Math.round((item.enrolled / item.approvedIntake) * 100);
        const isFull = pct >= 100;
        return (
          <div className="seat-bar-wrap">
            <div className="seat-bar">
              <div
                className={`seat-bar__fill${isFull ? ' seat-bar__fill--full' : ''}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <span className="seat-bar__text">{pct}%</span>
          </div>
        );
      },
    },
  ];

  const seatRows = seatAllocations.map((seat) => ({
    rowKey: seat.code,
    ...seat,
    programme: <strong>{seat.programme}</strong>,
    code: <code>{seat.code}</code>,
    approvedIntake: <span>{seat.approvedIntake}</span>,
    enrolled: <strong style={{ color: 'var(--ink)' }}>{seat.enrolled}</strong>,
    vacant: (
      <span style={{ color: seat.vacant === 0 ? 'var(--warning)' : 'var(--muted)' }}>
        {seat.vacant === 0 ? 'Full (0)' : seat.vacant}
      </span>
    ),
  }));

  const studentColumns = [
    { key: 'apaarId', label: 'APAAR ID' },
    { key: 'name', label: 'Candidate Name' },
    { key: 'programme', label: 'Programme' },
    { key: 'quota', label: 'Quota' },
    { key: 'validation', label: 'Validation Status' },
    { key: 'confirmation', label: 'Student Confirmation' },
    { key: 'action', label: 'Action' },
  ];

  const studentRows = students.map((stu) => {
    let valTone: 'success' | 'warning' | 'danger' = 'success';
    if (stu.validationStatus === 'Warning') valTone = 'warning';
    if (stu.validationStatus === 'Error') valTone = 'danger';

    let confTone: 'success' | 'warning' | 'danger' = 'success';
    if (stu.confirmationStatus === 'Pending') confTone = 'warning';
    if (stu.confirmationStatus === 'Disputed') confTone = 'danger';

    return {
      rowKey: stu.id,
      apaarId: <code className="record-code">{stu.apaarId}</code>,
      name: <strong>{stu.name}</strong>,
      programme: <span>{stu.programme}</span>,
      quota: <span className="micro-label" style={{ color: 'var(--muted)' }}>{stu.quota}</span>,
      validation: (
        <StatusBadge tone={valTone}>
          {stu.validationStatus === 'Clean' ? 'Validated · Clean' : `Flagged · ${stu.validationStatus}`}
        </StatusBadge>
      ),
      confirmation: (
        <StatusBadge tone={confTone}>
          {stu.confirmationStatus}
        </StatusBadge>
      ),
      action: (
        <button
          type="button"
          className="button button--small button--secondary"
          style={{ minHeight: '28px', padding: '0 9px', fontSize: '.7rem' }}
          onClick={() => setActiveStudent(stu)}
        >
          Inspect Record
        </button>
      ),
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="COLLEGE OFFICIAL · INSTITUTION WORKSPACE"
        title={profile.name}
        description={`AICTE Permanent Institute ID: ${profile.institutionId} · Affiliation: ${profile.affiliatingUniversity} · Academic Cycle: ${profile.academicCycle}`}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <StatusBadge tone="success">{profile.approvalStatus}</StatusBadge>
          </div>
        }
      />

      <Notice tone="info" label="Phase 1 Foundation · College Workspace">
        This portal demonstrates the institutional student data intake, validation preview, and confirmation tracking foundation under Problem Statement SIH26263. Data displayed is synthetic demo records.
      </Notice>

      <section className="panel workflow-panel">
        <SectionHeader
          title="Institutional Record Cycle"
          description="Five-stage procedural workflow from enrolment preparation to AICTE national oversight."
        />
        <WorkflowStrip role="college" />
      </section>

      <div className="stats-grid">
        <StatCard
          label="Total Intake & Enrolment"
          value={`${metrics.totalEnrolled} / ${metrics.totalSeats}`}
          detail={`${Math.round((metrics.totalEnrolled / metrics.totalSeats) * 100)}% capacity utilized across 4 programmes`}
          icon={GraduationCap}
        />
        <StatCard
          label="Rule-Based Record Validation"
          value={`${metrics.totalClean} Clean · ${metrics.totalFlagged} Flagged`}
          detail={`${metrics.totalFlagged} records require institutional remediation`}
          icon={ClipboardCheck}
        />
        <StatCard
          label="Student Confirmation Status"
          value={`${metrics.totalConfirmed} Confirmed · ${metrics.totalPendingConfirmation} Pending`}
          detail={`${Math.round((metrics.totalConfirmed / metrics.totalEnrolled) * 100)}% student verification response rate`}
          icon={BadgeCheck}
        />
        <StatCard
          label="AICTE Submission Batches"
          value={`${metrics.totalBatches} Active Batches`}
          detail="Batch BATCH-2026-01 locked for official submission"
          icon={FileClock}
        />
      </div>

      <div className="dashboard-columns">
        <section className="panel">
          <SectionHeader
            title="Approved Intake & Seat Allocation"
            description="Branch-wise seat compliance against AICTE approved intake caps."
            action={
              <Link to="/college/students/upload" className="text-link">
                Bulk intake <ArrowRight size={14} />
              </Link>
            }
          />
          <DataTable
            columns={seatColumns}
            rows={seatRows}
            caption="AICTE Programme Intake Capacity"
          />
          <p className="table-footnote">
            Enrolment caps are governed under AICTE Extension of Approval guidelines. Zero remaining seats locks new candidate allocations.
          </p>
        </section>

        <section className="panel">
          <SectionHeader
            title="Institutional Quick Actions"
            description="Operational shortcuts for candidate management."
          />
          <div className="quick-action-grid">
            <Link to="/college/students/add" className="quick-action-card">
              <div className="quick-action-card__top">
                <strong>Add Student</strong>
                <FilePlus2 size={16} />
              </div>
              <span>Manual single-record candidate intake via APAAR</span>
            </Link>

            <Link to="/college/students/upload" className="quick-action-card">
              <div className="quick-action-card__top">
                <strong>Upload Students</strong>
                <Upload size={16} />
              </div>
              <span>Bulk CSV / Excel intake with column mapping</span>
            </Link>

            <Link to="/college/flagged" className="quick-action-card">
              <div className="quick-action-card__top">
                <strong>Flagged Issues</strong>
                <Flag size={16} />
              </div>
              <span>
                <StatusBadge tone="warning">{metrics.totalFlagged} Require Action</StatusBadge>
              </span>
            </Link>

            <Link to="/college/confirmation" className="quick-action-card">
              <div className="quick-action-card__top">
                <strong>Confirmations</strong>
                <UserRound size={16} />
              </div>
              <span>
                <StatusBadge tone="info">{metrics.totalPendingConfirmation} Pending</StatusBadge>
              </span>
            </Link>
          </div>

          <div style={{ marginTop: '20px' }}>
            <SectionHeader
              title="Recent Institutional Activity"
              description="Chronological log of intake and validation events."
              action={
                <Link to="/college/activity" className="text-link">
                  View all <ArrowRight size={14} />
                </Link>
              }
            />
            <ActivityTimeline items={recentActivity.slice(0, 3)} />
          </div>
        </section>
      </div>

      <section className="panel dashboard-table">
        <SectionHeader
          title="Student Records & Enrolment Queue"
          description="APAAR-centred student records with real-time validation and confirmation tracking."
          action={
            <Link to="/college/students" className="text-link">
              Full registry ({metrics.totalEnrolled}) <ArrowRight size={14} />
            </Link>
          }
        />

        <div className="table-panel">
          <div className="table-panel__head">
            <Tabs
              items={['All', 'Flagged', 'Pending', 'Clean']}
              active={selectedTab}
              onChange={(tab) => setSelectedTab(tab as typeof selectedTab)}
            />
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by APAAR ID, name, branch or quota..."
            />
          </div>

          <DataTable
            columns={studentColumns}
            rows={studentRows}
            caption="Student Records Enrolment Queue"
            emptyMessage="No student records match the specified search or filter criteria."
          />
        </div>
        <p className="table-footnote">
          All records reference synthetic identifiers. In the operational design, student confirmation is authenticated via APAAR consent.
        </p>
      </section>

      {activeStudent && (
        <Modal
          open={Boolean(activeStudent)}
          title={`Candidate Record: ${activeStudent.name}`}
          onClose={() => setActiveStudent(null)}
        >
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>APAAR ID</span>
                <p style={{ margin: '2px 0 0', fontFamily: 'IBM Plex Mono, monospace', fontSize: '.85rem', fontWeight: 600 }}>
                  {activeStudent.apaarId}
                </p>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Programme</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{activeStudent.programme}</p>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Quota / Category</span>
                <p style={{ margin: '2px 0 0' }}>{activeStudent.quota}</p>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Academic Year</span>
                <p style={{ margin: '2px 0 0' }}>{activeStudent.academicYear}</p>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Validation Status</span>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge tone={activeStudent.validationStatus === 'Clean' ? 'success' : 'warning'}>
                    {activeStudent.validationStatus}
                  </StatusBadge>
                </div>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Student Confirmation</span>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge tone={activeStudent.confirmationStatus === 'Confirmed' ? 'success' : 'warning'}>
                    {activeStudent.confirmationStatus}
                  </StatusBadge>
                </div>
              </div>
            </div>

            {activeStudent.flags && activeStudent.flags.length > 0 && (
              <Notice tone="warning" label="Validation Flag Details">
                <ul style={{ margin: '4px 0 0', paddingLeft: '18px', fontSize: '.75rem' }}>
                  {activeStudent.flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </Notice>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                className="button button--secondary button--small"
                onClick={() => setActiveStudent(null)}
              >
                Close Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}


function CollegeStudentsPage() {
  const [selectedTab, setSelectedTab] = useState<'All' | 'Clean' | 'Flagged' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStudent, setActiveStudent] = useState<CollegeStudent | null>(null);

  const { getStudents, metrics } = useCollegeData();

  const tabFilterMap = {
    All: 'all',
    Clean: 'clean',
    Flagged: 'flagged',
    Pending: 'pending',
  } as const;

  const students = useMemo(() => {
    return getStudents({
      tab: tabFilterMap[selectedTab],
      query: searchQuery,
    });
  }, [getStudents, selectedTab, searchQuery]);

  const studentColumns = [
    { key: 'apaarId', label: 'APAAR ID' },
    { key: 'name', label: 'Candidate Name' },
    { key: 'programme', label: 'Programme' },
    { key: 'quota', label: 'Quota' },
    { key: 'validation', label: 'Validation Status' },
    { key: 'confirmation', label: 'Student Confirmation' },
    { key: 'enrolledDate', label: 'Enrolled On' },
    { key: 'action', label: 'Record Action' },
  ];

  const studentRows = students.map((stu) => {
    let valTone: 'success' | 'warning' | 'danger' = 'success';
    if (stu.validationStatus === 'Warning') valTone = 'warning';
    if (stu.validationStatus === 'Error') valTone = 'danger';

    let confTone: 'success' | 'warning' | 'danger' = 'success';
    if (stu.confirmationStatus === 'Pending') confTone = 'warning';
    if (stu.confirmationStatus === 'Disputed') confTone = 'danger';

    return {
      rowKey: stu.id,
      apaarId: <code className="record-code">{stu.apaarId}</code>,
      name: <strong>{stu.name}</strong>,
      programme: <span>{stu.programme}</span>,
      quota: <span className="micro-label" style={{ color: 'var(--muted)' }}>{stu.quota}</span>,
      validation: (
        <StatusBadge tone={valTone}>
          {stu.validationStatus === 'Clean' ? 'Validated · Clean' : `Flagged · ${stu.validationStatus}`}
        </StatusBadge>
      ),
      confirmation: (
        <StatusBadge tone={confTone}>
          {stu.confirmationStatus}
        </StatusBadge>
      ),
      enrolledDate: <span style={{ color: 'var(--muted)', fontSize: '.7rem' }}>{stu.enrolledDate}</span>,
      action: (
        <button
          type="button"
          className="button button--small button--secondary"
          style={{ minHeight: '28px', padding: '0 9px', fontSize: '.7rem' }}
          onClick={() => setActiveStudent(stu)}
        >
          Inspect Record
        </button>
      ),
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="COLLEGE OFFICIAL · STUDENT MANAGEMENT"
        title="Student Records Registry"
        description={`Authoritative institutional enrolment records indexed by APAAR ID. Total Enrolled: ${metrics.totalEnrolled} / Approved Seats: ${metrics.totalSeats}`}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/college/students/add" className="button button--primary button--small">
              <FilePlus2 size={15} /> Add Student
            </Link>
          </div>
        }
      />

      <Notice tone="info" label="Local Prototype Registry">
        Student records in this registry are stored in your local browser session store for prototype demonstration under Problem Statement SIH26263. Changes persist across navigation within this browser session.
      </Notice>

      <div className="stats-grid" style={{ marginBlock: '14px 18px' }}>
        <StatCard
          label="Total Registered"
          value={String(metrics.totalEnrolled)}
          detail={`${Math.round((metrics.totalEnrolled / metrics.totalSeats) * 100)}% capacity utilized`}
          icon={Users}
        />
        <StatCard
          label="Validated Clean"
          value={String(metrics.totalClean)}
          detail="Passed format & intake checks"
          icon={ClipboardCheck}
        />
        <StatCard
          label="Flagged for Remediation"
          value={String(metrics.totalFlagged)}
          detail="Requires college official review"
          icon={Flag}
        />
        <StatCard
          label="Pending Student Confirmation"
          value={String(metrics.totalPendingConfirmation)}
          detail="Awaiting candidate verification"
          icon={UserRound}
        />
      </div>

      <div className="table-panel">
        <div className="table-panel__head">
          <Tabs
            items={[
              `All (${metrics.totalEnrolled})`,
              `Clean (${metrics.totalClean})`,
              `Flagged (${metrics.totalFlagged})`,
              `Pending (${metrics.totalPendingConfirmation})`,
            ]}
            active={
              selectedTab === 'All'
                ? `All (${metrics.totalEnrolled})`
                : selectedTab === 'Clean'
                ? `Clean (${metrics.totalClean})`
                : selectedTab === 'Flagged'
                ? `Flagged (${metrics.totalFlagged})`
                : `Pending (${metrics.totalPendingConfirmation})`
            }
            onChange={(item) => {
              if (item.startsWith('All')) setSelectedTab('All');
              else if (item.startsWith('Clean')) setSelectedTab('Clean');
              else if (item.startsWith('Flagged')) setSelectedTab('Flagged');
              else if (item.startsWith('Pending')) setSelectedTab('Pending');
            }}
          />
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filter by APAAR ID, student name, branch..."
          />
        </div>

        {students.length === 0 ? (
          <EmptyState
            title="No matching student records found"
            description={
              searchQuery
                ? `No records match "${searchQuery}" under the selected filter tab. Try clearing the query or selecting another tab.`
                : 'There are no student records under this category yet.'
            }
            action={
              searchQuery ? (
                <button
                  type="button"
                  className="button button--secondary button--small"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search Filter
                </button>
              ) : (
                <Link to="/college/students/add" className="button button--primary button--small">
                  <FilePlus2 size={15} /> Add New Student
                </Link>
              )
            }
          />
        ) : (
          <DataTable
            columns={studentColumns}
            rows={studentRows}
            caption="Institutional Student Registry"
          />
        )}
      </div>
      <p className="table-footnote">
        Records are indexed by APAAR ID as primary student identity. Validation runs rule-based checks on format and seat quota limits.
      </p>

      {activeStudent && (
        <Modal
          open={Boolean(activeStudent)}
          title={`Candidate Record: ${activeStudent.name}`}
          onClose={() => setActiveStudent(null)}
        >
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>APAAR ID</span>
                <p style={{ margin: '2px 0 0', fontFamily: 'IBM Plex Mono, monospace', fontSize: '.85rem', fontWeight: 600 }}>
                  {activeStudent.apaarId}
                </p>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Programme</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{activeStudent.programme}</p>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Quota / Category</span>
                <p style={{ margin: '2px 0 0' }}>{activeStudent.quota}</p>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Academic Year</span>
                <p style={{ margin: '2px 0 0' }}>{activeStudent.academicYear}</p>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Enrolled Date</span>
                <p style={{ margin: '2px 0 0', fontSize: '.8rem' }}>{activeStudent.enrolledDate}</p>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Submission Batch</span>
                <p style={{ margin: '2px 0 0', fontFamily: 'IBM Plex Mono, monospace', fontSize: '.8rem' }}>
                  {activeStudent.batchId || 'BATCH-2026-02'}
                </p>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Validation Status</span>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge tone={activeStudent.validationStatus === 'Clean' ? 'success' : 'warning'}>
                    {activeStudent.validationStatus}
                  </StatusBadge>
                </div>
              </div>
              <div>
                <span className="micro-label" style={{ color: 'var(--muted)' }}>Student Confirmation</span>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge tone={activeStudent.confirmationStatus === 'Confirmed' ? 'success' : 'warning'}>
                    {activeStudent.confirmationStatus}
                  </StatusBadge>
                </div>
              </div>
            </div>

            {activeStudent.flags && activeStudent.flags.length > 0 && (
              <Notice tone="warning" label="Validation Flag Details">
                <ul style={{ margin: '4px 0 0', paddingLeft: '18px', fontSize: '.75rem' }}>
                  {activeStudent.flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </Notice>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                className="button button--secondary button--small"
                onClick={() => setActiveStudent(null)}
              >
                Close Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function AddStudentPage() {
  const { seatAllocations } = useCollegeData();

  const [apaarId, setApaarId] = useState('');
  const [name, setName] = useState('');
  const [programmeCode, setProgrammeCode] = useState(seatAllocations[0]?.code || 'CSE-101');
  const [quota, setQuota] = useState<'State Quota' | 'All India' | 'Management' | 'NRI'>('State Quota');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [batchId, setBatchId] = useState('BATCH-2026-02');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successStudent, setSuccessStudent] = useState<CollegeStudent | null>(null);

  const selectedSeat = seatAllocations.find((s) => s.code === programmeCode);
  const isSeatFull = selectedSeat ? selectedSeat.vacant <= 0 : false;

  const programmeOptions = seatAllocations.map((seat) => ({
    label: `${seat.programme} (${seat.vacant === 0 ? 'Full - 0 vacant' : `${seat.vacant} vacant`})`,
    value: seat.code,
  }));

  const quotaOptions = [
    { label: 'State Quota (UPTAC / State Counselling)', value: 'State Quota' },
    { label: 'All India Quota (AICTE / Central)', value: 'All India' },
    { label: 'Management Quota', value: 'Management' },
    { label: 'NRI / Supernumerary Quota', value: 'NRI' },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSuccessStudent(null);

    const result = collegeService.addStudent({
      apaarId,
      name,
      programmeCode,
      quota,
      academicYear,
      batchId,
    });

    if (!result.success && result.errors) {
      setErrors(result.errors);
      return;
    }

    if (result.success && result.student) {
      setSuccessStudent(result.student);
      setApaarId('');
      setName('');
    }
  }

  function handleReset() {
    setApaarId('');
    setName('');
    setErrors({});
    setSuccessStudent(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="COLLEGE OFFICIAL · MANUAL INTAKE"
        title="Add Student Record"
        description="Register an individual student enrolment record into the institutional registry using APAAR ID as primary identity."
        actions={
          <Link to="/college/students" className="button button--secondary button--small">
            <ArrowLeft size={15} /> Back to Records
          </Link>
        }
      />

      <Notice tone="warning" label="Privacy-First Prototype Notice">
        Do not input real Aadhaar numbers, biometric details, or sensitive personal documents. Use synthetic 12-digit APAAR numbers (e.g. <code>1234 5678 9012</code>) or demo identifiers (e.g. <code>APAAR-2026-9812-4410</code>). All data is saved to your local browser session store.
      </Notice>

      {successStudent && (
        <div style={{ marginBottom: '20px' }}>
          <Notice tone="success" label="Student Successfully Registered">
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '.84rem' }}>
                Enrolment record for <strong>{successStudent.name}</strong> has been saved to the institutional registry with APAAR ID <code>{successStudent.apaarId}</code> under <strong>{successStudent.programme}</strong>.
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link to="/college/students" className="button button--primary button--small">
                  View in Student Registry <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  className="button button--secondary button--small"
                  onClick={() => setSuccessStudent(null)}
                >
                  Add Another Student
                </button>
              </div>
            </div>
          </Notice>
        </div>
      )}

      <div className="form-card">
        <SectionHeader
          title="Candidate Enrolment Details"
          description="Enter verified institutional admission credentials for AICTE intake monitoring."
        />

        <form onSubmit={handleSubmit}>
          <div className="form-grid-two">
            <FormField
              label="APAAR ID (12 Digits or Demo Format)"
              name="apaarId"
              required
              value={apaarId}
              onChange={(e) => setApaarId(e.target.value)}
              placeholder="e.g. APAAR-2026-9812-4410 or 123456789012"
              hint="Automated Permanent Academic Account Registry identifier."
              error={errors.apaarId}
            />

            <FormField
              label="Candidate Full Name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Raman"
              hint="Legal candidate name as per qualifying 10+2 marksheet."
              error={errors.name}
            />
          </div>

          <div className="form-grid-two">
            <SelectField
              label="AICTE Approved Programme"
              name="programmeCode"
              options={programmeOptions}
              value={programmeCode}
              onChange={(e) => setProgrammeCode(e.target.value)}
            />

            <SelectField
              label="Admission Quota"
              name="quota"
              options={quotaOptions}
              value={quota}
              onChange={(e) => setQuota(e.target.value as typeof quota)}
            />
          </div>

          {isSeatFull && (
            <div style={{ marginBottom: '16px' }}>
              <Notice tone="warning" label="AICTE Seat Intake Warning">
                The selected programme has reached 100% of approved AICTE intake quota. Submitting will flag this record for seat overrun review.
              </Notice>
            </div>
          )}

          <div className="form-grid-two">
            <FormField
              label="Academic Cycle"
              name="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              hint="Standard AICTE academic batch."
            />

            <SelectField
              label="Submission Batch"
              name="batchId"
              options={[
                { label: 'BATCH-2026-02 (Open Intake Cycle)', value: 'BATCH-2026-02' },
                { label: 'BATCH-2026-03 (Supplementary Intake)', value: 'BATCH-2026-03' },
              ]}
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            />
          </div>

          <div className="form-actions-row">
            <button type="submit" className="button button--primary">
              <FilePlus2 size={16} /> Save &amp; Register Student
            </button>
            <button type="button" className="button button--secondary" onClick={handleReset}>
              Reset
            </button>
            <Link to="/college/students" className="text-link" style={{ marginLeft: 'auto' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines: string[][] = [];
  let row: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  const firstLine = text.split(/\r\n|\n/)[0] || '';
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(currentVal.trim());
      if (row.some((c) => c.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some((c) => c.length > 0)) {
      lines.push(row);
    }
  }

  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows = lines.slice(1);
  return { headers, rows };
}

type TargetField = 'apaarId' | 'name' | 'programmeCode' | 'quota' | 'academicYear' | 'batchId';

const TARGET_FIELDS: Array<{ key: TargetField; label: string; required: boolean; description: string }> = [
  { key: 'apaarId', label: 'APAAR ID / Student Reference', required: true, description: '12-digit number or APAAR-YYYY-XXXX-XXXX format' },
  { key: 'name', label: 'Candidate Full Name', required: true, description: 'Legal name from qualifying examination' },
  { key: 'programmeCode', label: 'AICTE Programme / Branch', required: true, description: 'Approved AICTE programme code (e.g. CSE-101) or branch name' },
  { key: 'quota', label: 'Admission Quota', required: true, description: 'State Quota, All India, Management, NRI' },
  { key: 'academicYear', label: 'Academic Cycle', required: false, description: 'Cycle (defaults to 2026-2027 if empty)' },
  { key: 'batchId', label: 'Submission Batch', required: false, description: 'Batch identifier (defaults to BATCH-2026-02)' },
];

function autoDetectMapping(headers: string[]): Record<TargetField, string> {
  const findMatch = (keywords: string[]) => {
    return (
      headers.find((h) =>
        keywords.some((kw) => h.toLowerCase().replace(/[^a-z0-9]/g, '').includes(kw)),
      ) || ''
    );
  };

  return {
    apaarId: findMatch(['apaar', 'reference', 'ref', 'reg', 'enrol', 'roll', 'id']) || headers[0] || '',
    name: findMatch(['name', 'candidate', 'student', 'full']) || headers[1] || '',
    programmeCode: findMatch(['programme', 'program', 'branch', 'course', 'dept', 'code']) || headers[2] || '',
    quota: findMatch(['quota', 'category', 'type', 'admission']) || headers[3] || '',
    academicYear: findMatch(['year', 'cycle', 'academic', 'session']) || '',
    batchId: findMatch(['batch']) || '',
  };
}

const SAMPLE_CSV = `APAAR ID,Candidate Legal Name,AICTE Programme,Admission Quota,Academic Year
APAAR-2026-9812-4411,Pooja Hegde,CSE-101,State Quota,2026-2027
APAAR-2026-9812-4412,Nikhil Choudhary,ECE-102,All India,2026-2027
APAAR-2026-9812-4413,Deepika Sengupta,ME-103,State Quota,2026-2027
APAAR-2026-9812-4411,Pooja Hegde,CSE-101,State Quota,2026-2027
123456789014,Farhan Qureshi,MBA-201,Management,2026-2027
APAAR-2026-9812-4415,,CSE-101,State Quota,2026-2027`;

type ParsedRow = {
  index: number;
  rawApaarId: string;
  rawName: string;
  rawProgramme: string;
  rawQuota: string;
  rawAcademicYear: string;
  rawBatchId: string;
  normalizedApaarId: string;
  normalizedName: string;
  normalizedProgrammeCode: string;
  normalizedQuota: 'State Quota' | 'All India' | 'Management' | 'NRI';
  normalizedProgrammeName: string;
  status: 'Valid' | 'Duplicate' | 'Invalid';
  errors: string[];
};

function UploadStudentsPage() {
  const { seatAllocations, getExistingApaarIds } = useCollegeData();

  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'success'>('upload');
  const [filename, setFilename] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<TargetField, string>>({
    apaarId: '',
    name: '',
    programmeCode: '',
    quota: '',
    academicYear: '',
    batchId: '',
  });

  const [xlsxNotice, setXlsxNotice] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    totalProcessed: number;
    importedCount: number;
    duplicateCount: number;
    invalidCount: number;
  } | null>(null);

  function loadCSVContent(text: string, name: string) {
    const parsed = parseCSV(text);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      alert('The provided file appears to be empty or does not contain data rows.');
      return;
    }
    setFilename(name);
    setHeaders(parsed.headers);
    setRawRows(parsed.rows);
    setMapping(autoDetectMapping(parsed.headers));
    setXlsxNotice(false);
    setStep('mapping');
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      setXlsxNotice(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      loadCSVContent(content, file.name);
    };
    reader.readAsText(file);
  }

  function handleLoadSample() {
    loadCSVContent(SAMPLE_CSV, 'sample-aicte-intake-2026.csv');
  }

  function resolveProgramme(rawProg: string): { code: string; name: string } | null {
    const trimmed = rawProg.trim().toUpperCase();
    const matchedByCode = seatAllocations.find((s) => s.code.toUpperCase() === trimmed);
    if (matchedByCode) return { code: matchedByCode.code, name: matchedByCode.programme };

    const lower = rawProg.toLowerCase();
    if (lower.includes('computer') || lower.includes('cse')) {
      const seat = seatAllocations.find((s) => s.code === 'CSE-101');
      return seat ? { code: seat.code, name: seat.programme } : null;
    }
    if (lower.includes('electronic') || lower.includes('ece')) {
      const seat = seatAllocations.find((s) => s.code === 'ECE-102');
      return seat ? { code: seat.code, name: seat.programme } : null;
    }
    if (lower.includes('mechanical') || lower.includes('me')) {
      const seat = seatAllocations.find((s) => s.code === 'ME-103');
      return seat ? { code: seat.code, name: seat.programme } : null;
    }
    if (lower.includes('mba') || lower.includes('business') || lower.includes('management')) {
      const seat = seatAllocations.find((s) => s.code === 'MBA-201');
      return seat ? { code: seat.code, name: seat.programme } : null;
    }

    return null;
  }

  function normalizeQuota(rawQuota: string): 'State Quota' | 'All India' | 'Management' | 'NRI' {
    const lower = rawQuota.toLowerCase().trim();
    if (lower.includes('all india') || lower === 'ai') return 'All India';
    if (lower.includes('management') || lower.includes('mgmt')) return 'Management';
    if (lower.includes('nri') || lower.includes('supernumerary')) return 'NRI';
    return 'State Quota';
  }

  const parsedRows: ParsedRow[] = useMemo(() => {
    if (step !== 'preview' && step !== 'success') return [];

    const existingIds = getExistingApaarIds();
    const seenInFile = new Set<string>();

    const getColIndex = (headerName: string) => headers.indexOf(headerName);
    const idxApaar = getColIndex(mapping.apaarId);
    const idxName = getColIndex(mapping.name);
    const idxProg = getColIndex(mapping.programmeCode);
    const idxQuota = getColIndex(mapping.quota);
    const idxYear = getColIndex(mapping.academicYear);
    const idxBatch = getColIndex(mapping.batchId);

    return rawRows.map((cols, index): ParsedRow => {
      const rawApaar = idxApaar >= 0 ? cols[idxApaar] || '' : '';
      const rawName = idxName >= 0 ? cols[idxName] || '' : '';
      const rawProg = idxProg >= 0 ? cols[idxProg] || '' : '';
      const rawQuota = idxQuota >= 0 ? cols[idxQuota] || '' : '';
      const rawYear = idxYear >= 0 ? cols[idxYear] || '' : '';
      const rawBatch = idxBatch >= 0 ? cols[idxBatch] || '' : '';

      const errors: string[] = [];
      const trimmedApaar = rawApaar.trim().toUpperCase();
      const trimmedName = rawName.trim();
      const digitsOnly = trimmedApaar.replace(/\D/g, '');

      if (!trimmedApaar) {
        errors.push('Missing APAAR ID');
      } else {
        const isStandardSynthetic = /^APAAR-\d{4}-\d{4}-\d{4}$/i.test(trimmedApaar);
        const isTwelveDigit = digitsOnly.length === 12;
        if (!isStandardSynthetic && !isTwelveDigit) {
          errors.push('Invalid APAAR format (must be 12 digits or APAAR-YYYY-XXXX-XXXX)');
        }
      }

      if (!trimmedName) {
        errors.push('Missing Candidate Name');
      } else if (trimmedName.length < 2) {
        errors.push('Name must be at least 2 characters');
      } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
        errors.push('Name contains invalid characters');
      }

      const progResolved = resolveProgramme(rawProg);
      if (!rawProg.trim()) {
        errors.push('Missing Programme');
      } else if (!progResolved) {
        errors.push(`Unrecognized programme '${rawProg}'`);
      }

      let isDuplicate = false;
      if (trimmedApaar) {
        const key = digitsOnly.length === 12 ? digitsOnly : trimmedApaar;
        if (seenInFile.has(key)) {
          isDuplicate = true;
          errors.push('Duplicate: identical APAAR ID appears multiple times in file');
        } else {
          seenInFile.add(key);
        }

        if (existingIds.has(trimmedApaar) || (digitsOnly.length === 12 && existingIds.has(digitsOnly))) {
          isDuplicate = true;
          errors.push('Duplicate: candidate already enrolled in institutional store');
        }
      }

      let status: 'Valid' | 'Duplicate' | 'Invalid' = 'Valid';
      if (isDuplicate) {
        status = 'Duplicate';
      } else if (errors.length > 0) {
        status = 'Invalid';
      }

      return {
        index: index + 1,
        rawApaarId: rawApaar,
        rawName,
        rawProgramme: rawProg,
        rawQuota,
        rawAcademicYear: rawYear,
        rawBatchId: rawBatch,
        normalizedApaarId: trimmedApaar,
        normalizedName: trimmedName,
        normalizedProgrammeCode: progResolved?.code || 'CSE-101',
        normalizedProgrammeName: progResolved?.name || rawProg,
        normalizedQuota: normalizeQuota(rawQuota),
        status,
        errors,
      };
    });
  }, [step, rawRows, headers, mapping, seatAllocations, getExistingApaarIds]);

  const validRows = parsedRows.filter((r) => r.status === 'Valid');
  const duplicateRows = parsedRows.filter((r) => r.status === 'Duplicate');
  const invalidRows = parsedRows.filter((r) => r.status === 'Invalid');

  function handleConfirmImport() {
    if (validRows.length === 0) return;

    const inputs: AddStudentInput[] = validRows.map((r) => ({
      apaarId: r.normalizedApaarId,
      name: r.normalizedName,
      programmeCode: r.normalizedProgrammeCode,
      quota: r.normalizedQuota,
      academicYear: r.rawAcademicYear || '2026-2027',
      batchId: r.rawBatchId || 'BATCH-2026-02',
    }));

    collegeService.addStudentsBulk(inputs);

    setImportSummary({
      totalProcessed: parsedRows.length,
      importedCount: validRows.length,
      duplicateCount: duplicateRows.length,
      invalidCount: invalidRows.length,
    });

    setStep('success');
  }

  function handleReset() {
    setStep('upload');
    setFilename('');
    setHeaders([]);
    setRawRows([]);
    setXlsxNotice(false);
    setImportSummary(null);
  }

  const previewColumns = [
    { key: 'rowNum', label: 'Row' },
    { key: 'apaarId', label: 'APAAR ID' },
    { key: 'name', label: 'Candidate Name' },
    { key: 'programme', label: 'Mapped Programme' },
    { key: 'quota', label: 'Quota' },
    { key: 'status', label: 'Row Status' },
    { key: 'notes', label: 'Validation / Duplicate Checks' },
  ];

  const previewTableRows = parsedRows.map((row) => ({
    rowKey: row.index,
    rowNum: <code style={{ color: 'var(--muted)', fontSize: '.7rem' }}>#{row.index}</code>,
    apaarId: <code className="record-code">{row.normalizedApaarId || '—'}</code>,
    name: <strong>{row.normalizedName || '—'}</strong>,
    programme: <span>{row.normalizedProgrammeName}</span>,
    quota: <span className="micro-label" style={{ color: 'var(--muted)' }}>{row.normalizedQuota}</span>,
    status: (
      <StatusBadge
        tone={
          row.status === 'Valid'
            ? 'success'
            : row.status === 'Duplicate'
            ? 'warning'
            : 'danger'
        }
      >
        {row.status}
      </StatusBadge>
    ),
    notes: (
      <div className="validation-badge-group">
        {row.errors.length === 0 ? (
          <span style={{ color: 'var(--success)', fontSize: '.7rem' }}>Ready for import</span>
        ) : (
          row.errors.map((err, i) => (
            <span key={i} className="row-error-tag">
              {err}
            </span>
          ))
        )}
      </div>
    ),
  }));

  return (
    <>
      <PageHeader
        eyebrow="COLLEGE OFFICIAL · BULK DATA INTAKE"
        title="Upload Student Records"
        description="Import multiple candidate enrolment records using structured CSV file format with column mapping and validation."
        actions={
          <Link to="/college/students" className="button button--secondary button--small">
            <ArrowLeft size={15} /> Back to Records
          </Link>
        }
      />

      <nav className="upload-stepper" aria-label="Bulk upload stages">
        <div className={`upload-step ${step === 'upload' ? 'upload-step--active' : 'upload-step--complete'}`}>
          <span className="upload-step__index">01</span>
          <span>Upload File</span>
        </div>
        <ChevronRight size={14} aria-hidden="true" style={{ color: 'var(--line-strong)' }} />
        <div className={`upload-step ${step === 'mapping' ? 'upload-step--active' : step === 'preview' || step === 'success' ? 'upload-step--complete' : ''}`}>
          <span className="upload-step__index">02</span>
          <span>Map Columns</span>
        </div>
        <ChevronRight size={14} aria-hidden="true" style={{ color: 'var(--line-strong)' }} />
        <div className={`upload-step ${step === 'preview' ? 'upload-step--active' : step === 'success' ? 'upload-step--complete' : ''}`}>
          <span className="upload-step__index">03</span>
          <span>Preview &amp; Validate</span>
        </div>
        <ChevronRight size={14} aria-hidden="true" style={{ color: 'var(--line-strong)' }} />
        <div className={`upload-step ${step === 'success' ? 'upload-step--active' : ''}`}>
          <span className="upload-step__index">04</span>
          <span>Complete</span>
        </div>
      </nav>

      {step === 'upload' && (
        <>
          <Notice tone="info" label="CSV Bulk Upload · Prototype Format">
            Bulk upload accepts comma-separated (CSV), tab-separated (TSV), or plain text files. Uploaded records will be parsed locally in your browser and checked against existing APAAR IDs and AICTE seat quotas before saving.
          </Notice>

          <Notice tone="warning" label="Privacy Notice">
            Do not upload real Aadhaar numbers, caste/biometric documents, or unencrypted personal certificates. Use synthetic APAAR identifiers only.
          </Notice>

          {xlsxNotice && (
            <div style={{ marginBlock: '16px' }}>
              <Notice tone="warning" label="Excel Binary Spreadsheet (.xlsx) Selected">
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '.8rem' }}>
                    Excel <code>.xlsx</code> files use a binary zipped XML archive format. For this lightweight client prototype, please save or export your spreadsheet as a <strong>CSV (.csv)</strong> file from Excel / Google Sheets and upload it here.
                  </p>
                  <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--muted)' }}>
                    Alternatively, an external spreadsheet parser (e.g. <code>read-excel-file</code> or <code>xlsx</code>) can be integrated in later phases.
                  </p>
                </div>
              </Notice>
            </div>
          )}

          <div className="panel" style={{ marginTop: '16px' }}>
            <label
              htmlFor="csv-file-input"
              className="upload-dropzone"
            >
              <div className="upload-dropzone__icon">
                <Upload size={22} />
              </div>
              <div>
                <h3>Select or drop student CSV file</h3>
                <p>Supports .csv, .tsv, and .txt files with column headers. Maximum 500 rows recommended for client demonstration.</p>
              </div>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,.txt,.tsv,.xlsx"
                className="sr-only"
                onChange={handleFileSelect}
              />
              <span className="button button--secondary button--small">
                Browse Local Files
              </span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
              <div>
                <strong style={{ fontSize: '.82rem', color: 'var(--ink)' }}>Need test data?</strong>
                <p style={{ margin: '2px 0 0', fontSize: '.72rem', color: 'var(--muted)' }}>
                  Load our pre-configured AICTE intake demo CSV with 6 test records (including valid candidates, an in-file duplicate, and format errors).
                </p>
              </div>
              <button
                type="button"
                className="button button--primary button--small"
                onClick={handleLoadSample}
              >
                <FileSpreadsheet size={15} /> Load Sample AICTE CSV Data
              </button>
            </div>
          </div>
        </>
      )}

      {step === 'mapping' && (
        <div className="panel">
          <SectionHeader
            title={`Map Columns from '${filename}'`}
            description={`Detected ${headers.length} columns and ${rawRows.length} data rows. Verify which file column maps to each institutional schema field.`}
            action={
              <button
                type="button"
                className="button button--secondary button--small"
                onClick={handleReset}
              >
                Change File
              </button>
            }
          />

          <div className="mapping-grid">
            {TARGET_FIELDS.map((field) => (
              <div key={field.key} className="form-field">
                <label>
                  {field.label} {field.required && <span className="required-marker">*</span>}
                </label>
                <div className="select-wrap">
                  <select
                    value={mapping[field.key] || ''}
                    onChange={(e) =>
                      setMapping({ ...mapping, [field.key]: e.target.value })
                    }
                  >
                    <option value="">-- Do not import / Not present --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h} {rawRows[0]?.[headers.indexOf(h)] ? `(e.g. "${rawRows[0][headers.indexOf(h)]}")` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronRight size={16} aria-hidden="true" />
                </div>
                <p className="form-field__hint">{field.description}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '14px', background: '#f8faf8', border: '1px solid var(--line)', borderRadius: '4px' }}>
            <strong style={{ fontSize: '.76rem', color: 'var(--ink)' }}>First row preview from file:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
              {headers.map((h, i) => (
                <div key={h} style={{ fontSize: '.7rem', color: 'var(--muted)' }}>
                  <code style={{ color: 'var(--accent)' }}>{h}</code>: "{rawRows[0]?.[i] || ''}"
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions-row">
            <button
              type="button"
              className="button button--primary"
              disabled={!mapping.apaarId || !mapping.name || !mapping.programmeCode}
              onClick={() => setStep('preview')}
            >
              Proceed to Preview &amp; Validation <ArrowRight size={15} />
            </button>
            <button type="button" className="button button--secondary" onClick={handleReset}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <>
          <SectionHeader
            title="Import Validation Preview"
            description={`Parsed ${parsedRows.length} rows from '${filename}'. Review valid rows, duplicate warnings, and format errors before committing to the institutional store.`}
          />

          <div className="stats-grid">
            <StatCard
              label="Total Rows Read"
              value={String(parsedRows.length)}
              detail="Total parsed from CSV"
              icon={FileText}
            />
            <StatCard
              label="Valid for Import"
              value={String(validRows.length)}
              detail="Ready to be added to registry"
              icon={Check}
            />
            <StatCard
              label="Duplicates Detected"
              value={String(duplicateRows.length)}
              detail="In-file or existing in store"
              icon={Flag}
            />
            <StatCard
              label="Validation Errors"
              value={String(invalidRows.length)}
              detail="Missing or invalid fields"
              icon={CircleHelp}
            />
          </div>

          {invalidRows.length > 0 || duplicateRows.length > 0 ? (
            <Notice tone="warning" label="Duplicate and Error Rows Will Be Excluded">
              Only the <strong>{validRows.length}</strong> valid, non-duplicate candidate records will be imported into the institutional registry. <strong>{duplicateRows.length + invalidRows.length}</strong> records have errors or duplicate APAAR IDs and will be skipped.
            </Notice>
          ) : (
            <Notice tone="success" label="All Records Valid">
              All <strong>{validRows.length}</strong> candidate records passed format, duplicate, and programme validation checks and are ready for import.
            </Notice>
          )}

          <div className="table-panel" style={{ marginTop: '14px' }}>
            <DataTable
              columns={previewColumns}
              rows={previewTableRows}
              caption="Candidate Import Row Preview"
            />
          </div>

          <div className="form-actions-row">
            <button
              type="button"
              className="button button--primary"
              disabled={validRows.length === 0}
              onClick={handleConfirmImport}
            >
              <Upload size={16} /> Confirm &amp; Import {validRows.length} Valid Records
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setStep('mapping')}
            >
              Adjust Column Mapping
            </button>
            <button type="button" className="button button--secondary" onClick={handleReset}>
              Cancel &amp; Restart
            </button>
          </div>
        </>
      )}

      {step === 'success' && importSummary && (
        <div className="panel" style={{ maxWidth: '820px', marginInline: 'auto' }}>
          <Notice tone="success" label="Bulk Import Successfully Completed">
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '.88rem' }}>
                Successfully imported <strong>{importSummary.importedCount}</strong> verified student enrolment records into the institutional registry.
              </p>
              <ul style={{ margin: '0 0 14px', paddingLeft: '18px', fontSize: '.76rem', color: 'var(--muted)' }}>
                <li>Processed: {importSummary.totalProcessed} total rows</li>
                <li>Imported: {importSummary.importedCount} records added to store</li>
                <li>Skipped Duplicates: {importSummary.duplicateCount} records</li>
                <li>Skipped Errors: {importSummary.invalidCount} records</li>
              </ul>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link to="/college/students" className="button button--primary button--small">
                  <Users size={15} /> View in Student Registry
                </Link>
                <button
                  type="button"
                  className="button button--secondary button--small"
                  onClick={handleReset}
                >
                  <RefreshCw size={14} /> Upload Another File
                </button>
                <Link to="/college" className="text-link" style={{ marginLeft: 'auto' }}>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </Notice>
        </div>
      )}
    </>
  );
}

function CollegeConfirmationPage() {
  const [selectedTab, setSelectedTab] = useState<'Pending' | 'All' | 'Confirmed' | 'Disputed'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStudent, setActiveStudent] = useState<CollegeStudent | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ studentId: string; message: string; tone: 'success' | 'danger' } | null>(null);

  const { getStudents, metrics } = useCollegeData();

  const allStudents = useMemo(() => getStudents({ query: searchQuery }), [getStudents, searchQuery]);

  const filtered = useMemo(() => {
    if (selectedTab === 'All') return allStudents;
    return allStudents.filter((s) => s.confirmationStatus === selectedTab);
  }, [allStudents, selectedTab]);

  const pendingCount = useMemo(() => allStudents.filter((s) => s.confirmationStatus === 'Pending').length, [allStudents]);
  const confirmedCount = useMemo(() => allStudents.filter((s) => s.confirmationStatus === 'Confirmed').length, [allStudents]);
  const disputedCount = useMemo(() => allStudents.filter((s) => s.confirmationStatus === 'Disputed').length, [allStudents]);

  const handleStatusUpdate = (studentId: string, newStatus: 'Confirmed' | 'Disputed') => {
    const result = collegeService.updateConfirmationStatus(studentId, newStatus);
    if (result.success) {
      setActionFeedback({ studentId, message: `Status updated to ${newStatus}.`, tone: 'success' });
      if (activeStudent?.id === studentId) setActiveStudent(null);
    } else {
      setActionFeedback({ studentId, message: result.error || 'Update failed.', tone: 'danger' });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const columns = [
    { key: 'apaarId', label: 'APAAR ID' },
    { key: 'name', label: 'Candidate Name' },
    { key: 'programme', label: 'Programme' },
    { key: 'status', label: 'Current Status' },
    { key: 'enrolledDate', label: 'Enrolled On' },
    { key: 'actions', label: 'Confirmation Action' },
  ];

  const rows = filtered.map((stu) => {
    let confTone: 'success' | 'warning' | 'danger' = 'success';
    if (stu.confirmationStatus === 'Pending') confTone = 'warning';
    if (stu.confirmationStatus === 'Disputed') confTone = 'danger';

    return {
      rowKey: stu.id,
      apaarId: <code className="record-code">{stu.apaarId}</code>,
      name: <strong>{stu.name}</strong>,
      programme: <span>{stu.programme}</span>,
      status: (
        <StatusBadge tone={confTone}>
          {stu.confirmationStatus}
        </StatusBadge>
      ),
      enrolledDate: <span style={{ color: 'var(--muted)', fontSize: '.7rem' }}>{stu.enrolledDate}</span>,
      actions: (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {stu.confirmationStatus !== 'Confirmed' && (
            <button
              type="button"
              className="button button--small button--primary"
              style={{ minHeight: '26px', padding: '0 8px', fontSize: '.68rem' }}
              onClick={() => handleStatusUpdate(stu.id, 'Confirmed')}
            >
              <Check size={12} /> Confirm
            </button>
          )}
          {stu.confirmationStatus !== 'Disputed' && (
            <button
              type="button"
              className="button button--small button--secondary"
              style={{ minHeight: '26px', padding: '0 8px', fontSize: '.68rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
              onClick={() => handleStatusUpdate(stu.id, 'Disputed')}
            >
              <Flag size={12} /> Contest
            </button>
          )}
          <button
            type="button"
            className="button button--small button--secondary"
            style={{ minHeight: '26px', padding: '0 8px', fontSize: '.68rem' }}
            onClick={() => setActiveStudent(stu)}
          >
            Inspect
          </button>
        </div>
      ),
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="COLLEGE OFFICIAL · CONFIRMATION MANAGEMENT"
        title="Student Confirmation Tracking"
        description="Review and update student confirmation statuses. Confirmed records have been verified by the institution; contested records are flagged for review."
        actions={
          <Link to="/college/students" className="button button--secondary button--small">
            <ArrowLeft size={15} /> Back to Records
          </Link>
        }
      />

      <Notice label="Prototype Scope">
        This confirmation workflow operates on local demo data only. In a production system, confirmation would be authenticated via APAAR-linked student consent. No real identity verification occurs here.
      </Notice>

      {actionFeedback && (
        <div style={{ marginBlock: '12px' }}>
          <Notice tone={actionFeedback.tone === 'success' ? 'info' : 'warning'} label={actionFeedback.tone === 'success' ? 'Success' : 'Error'}>
            {actionFeedback.message}
          </Notice>
        </div>
      )}

      <div className="stats-grid" style={{ marginBlock: '20px' }}>
        <StatCard label="Pending Confirmation" value={String(pendingCount)} detail="Records awaiting institutional confirmation" icon={FileClock} />
        <StatCard label="Confirmed" value={String(confirmedCount)} detail="Records confirmed by institution" icon={BadgeCheck} />
        <StatCard label="Contested / Disputed" value={String(disputedCount)} detail="Records flagged for review" icon={Flag} />
        <StatCard label="Total Records" value={String(metrics.totalEnrolled)} detail={`${Math.round((confirmedCount / Math.max(1, metrics.totalEnrolled)) * 100)}% confirmation rate`} icon={Users} />
      </div>

      <div className="table-panel">
        <div className="table-panel__head">
          <Tabs
            items={[
              `Pending (${pendingCount})`,
              `All (${allStudents.length})`,
              `Confirmed (${confirmedCount})`,
              `Disputed (${disputedCount})`,
            ]}
            active={
              selectedTab === 'Pending'
                ? `Pending (${pendingCount})`
                : selectedTab === 'All'
                ? `All (${allStudents.length})`
                : selectedTab === 'Confirmed'
                ? `Confirmed (${confirmedCount})`
                : `Disputed (${disputedCount})`
            }
            onChange={(item) => {
              if (item.startsWith('Pending')) setSelectedTab('Pending');
              else if (item.startsWith('All')) setSelectedTab('All');
              else if (item.startsWith('Confirmed')) setSelectedTab('Confirmed');
              else if (item.startsWith('Disputed')) setSelectedTab('Disputed');
            }}
          />
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filter by APAAR ID, student name, programme..."
          />
        </div>
        <DataTable columns={columns} rows={rows} caption="Student confirmation records" />
        {filtered.length === 0 && (
          <EmptyState
            title={searchQuery ? 'No matching records' : `No ${selectedTab.toLowerCase()} records`}
            description={searchQuery ? 'Try adjusting the search query.' : `There are no students with ${selectedTab.toLowerCase()} confirmation status.`}
          />
        )}
      </div>

      <p className="table-footnote">
        All records reference synthetic prototype identifiers. Confirmation status changes are saved to browser localStorage and reflected across this session.
      </p>

      {activeStudent && (
        <Modal title="Student Record Inspection" onClose={() => setActiveStudent(null)}>
          <dl className="record-detail-grid">
            <dt>Student ID</dt><dd><code>{activeStudent.id}</code></dd>
            <dt>APAAR ID</dt><dd><code>{activeStudent.apaarId}</code></dd>
            <dt>Name</dt><dd>{activeStudent.name}</dd>
            <dt>Programme</dt><dd>{activeStudent.programme} <span className="micro-label">({activeStudent.programmeCode})</span></dd>
            <dt>Quota</dt><dd>{activeStudent.quota}</dd>
            <dt>Academic Year</dt><dd>{activeStudent.academicYear}</dd>
            <dt>Enrolled On</dt><dd>{activeStudent.enrolledDate}</dd>
            <dt>Submission Batch</dt>
            <dd>
              <span className="micro-label" style={{ color: 'var(--muted)' }}>
                {activeStudent.batchId || 'BATCH-2026-02'}
              </span>
            </dd>
            <dt>Validation Status</dt>
            <dd>
              <StatusBadge tone={activeStudent.validationStatus === 'Clean' ? 'success' : 'warning'}>
                {activeStudent.validationStatus}
              </StatusBadge>
            </dd>
            <dt>Confirmation Status</dt>
            <dd>
              <StatusBadge tone={activeStudent.confirmationStatus === 'Confirmed' ? 'success' : activeStudent.confirmationStatus === 'Disputed' ? 'danger' : 'warning'}>
                {activeStudent.confirmationStatus}
              </StatusBadge>
            </dd>
            {activeStudent.flags && activeStudent.flags.length > 0 && (
              <>
                <dt>Flags</dt>
                <dd>
                  {activeStudent.flags.map((f) => (
                    <span key={f} className="row-error-tag" style={{ display: 'block', marginBottom: '4px' }}>{f}</span>
                  ))}
                </dd>
              </>
            )}
          </dl>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
            {activeStudent.confirmationStatus !== 'Confirmed' && (
              <button
                type="button"
                className="button button--primary button--small"
                onClick={() => handleStatusUpdate(activeStudent.id, 'Confirmed')}
              >
                <Check size={14} /> Confirm Record
              </button>
            )}
            {activeStudent.confirmationStatus !== 'Disputed' && (
              <button
                type="button"
                className="button button--secondary button--small"
                style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                onClick={() => handleStatusUpdate(activeStudent.id, 'Disputed')}
              >
                <Flag size={14} /> Contest Record
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
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
  if (path === '/college/students') return <CollegeStudentsPage />;
  if (path === '/college/students/add') return <AddStudentPage />;
  if (path === '/college/students/upload') return <UploadStudentsPage />;
  if (path === '/college/confirmation') return <CollegeConfirmationPage />;
  if (path === '/aicte/students' || path === '/student/academic-record') {
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
