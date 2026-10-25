import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from './components';
import TechText from './react-bits/TechText';
import WebThreads from './react-bits/WebThreads';
import './landing.css';

const sections = [
  { id: 'what-we-build', label: 'What We Build' },
  { id: 'our-method', label: 'Our Method' },
  { id: 'who-we-are', label: 'Who We Are' },
  { id: 'thinking', label: 'Thinking' },
  { id: 'contact', label: 'Contact' },
];

const accessPath = '/prototype/access';

/** The four states a record passes through, shown along the hero's bus. */
const stage = [
  { index: '01', title: 'Institution data', detail: 'Structured intake' },
  { index: '02', title: 'Validation', detail: 'Rules & duplicates' },
  { index: '03', title: 'Confirmation', detail: 'Student sign-off' },
  { index: '04', title: 'Visibility', detail: 'AICTE oversight' },
];

const capabilities = [
  {
    index: '01',
    title: 'Student data intake',
    body: 'Institutions prepare and submit student and enrolment records through a structured workflow instead of ad hoc files passed between offices.',
    tag: 'Interface staged',
  },
  {
    index: '02',
    title: 'Automated validation',
    body: 'Submissions are checked for formatting problems, duplicates and inconsistencies, and the results are surfaced where a reviewer can act on them.',
    tag: 'Interface staged',
  },
  {
    index: '03',
    title: 'Student confirmation',
    body: 'Students see what was submitted about them and confirm their own enrolment, adding a second source of truth to the same record.',
    tag: 'Interface staged',
  },
  {
    index: '04',
    title: 'AICTE visibility',
    body: 'Oversight views over enrolment patterns, anomalies and institutional data, designed to be read rather than mined.',
    tag: 'Interface staged',
  },
  {
    index: '05',
    title: 'Controlled verification',
    body: 'A confirmed record can support consented, purpose-bound verification through the platform’s verification architecture.',
    tag: 'Planned',
  },
];

const method = [
  {
    title: 'Submit',
    body: 'The institution prepares its student and enrolment records inside a structured intake flow. Nothing is accepted as a free-form file.',
    tag: 'Interface staged',
  },
  {
    title: 'Validate',
    body: 'Submitted records are checked for missing fields, duplicates and inconsistencies before they move any further.',
    tag: 'Interface staged',
  },
  {
    title: 'Confirm',
    body: 'The student reviews the details held about them and confirms their enrolment, adding the second signature to the record.',
    tag: 'Interface staged',
  },
  {
    title: 'Review',
    body: 'Conflicts and anomalies surface for institutional and AICTE review, with the evidence attached, rather than disappearing into a spreadsheet.',
    tag: 'Interface staged',
  },
  {
    title: 'Verify',
    body: 'Only then is a record eligible for controlled verification, scoped to a stated purpose and the minimum information that answers it.',
    tag: 'Planned',
  },
];

const principles = [
  ['Student-confirmed enrolment', 'The student is a participant in the record, not a row in a file.'],
  ['Structured submissions', 'Institutional data arrives in a shape that can actually be checked.'],
  ['Validation', 'Duplicates, gaps and conflicts are surfaced rather than smoothed over.'],
  ['Auditability', 'Actions around a record are designed so they can be found and reviewed later.'],
  ['Controlled verification', 'Access is purpose-bound and consent-aware by design.'],
  ['Better visibility', 'AICTE reads enrolment as it stands, not as it was reported.'],
];

const notes = [
  {
    meta: 'Enrolment · 01',
    title: 'Why student-confirmed enrolment matters',
    body: 'A submitted record describes what an institution believes. A confirmed record describes what the student agrees to. Most enrolment disputes live in that gap, and it is the cheapest thing in the whole pipeline to close.',
  },
  {
    meta: 'Validation · 02',
    title: 'Validation is a design problem, not a checkbox',
    body: 'A rule check only helps if its output is readable. A list of failures without context just moves work from one queue to another. The useful version shows what disagreed, with what, and why it matters to a reviewer.',
  },
  {
    meta: 'Verification · 03',
    title: 'Verification should be narrow on purpose',
    body: 'The safest verification answers one specific question with the minimum information needed, such as whether a student is enrolled in a given year, and leaves no unnecessary copy of the answer behind.',
  },
];

function reveal(delay: number): CSSProperties {
  return { '--reveal-delay': `${delay}ms` } as CSSProperties;
}

/** Lights the header once the page has moved and keeps nav state in sync. */
function useActiveSection() {
  const [active, setActive] = useState('');

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!targets.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-42% 0px -46% 0px', threshold: [0, 0.2, 0.5, 1] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return active;
}

/** Reveals [data-reveal] blocks once, and shows everything immediately when motion is reduced. */
function useScrollReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => node.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function LandingHeader() {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    const update = () => setStuck(window.scrollY > 16);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <header className={`lp-header${stuck ? ' is-stuck' : ''}`}>
      <div className="lp-header__inner">
        <a className="lp-header__brand" href="#top" aria-label="Sudharshan, back to the top">
          <Brand tone="inverse" />
        </a>
        <nav className="lp-nav" aria-label="Primary">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`lp-nav__link${active === section.id ? ' is-active' : ''}`}
              aria-current={active === section.id ? 'true' : undefined}
            >
              {section.label}
            </a>
          ))}
        </nav>
        <div className="lp-header__actions">
          <Link className="lp-header__cta" to={accessPath}>
            Get started <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
          <button
            className="lp-header__toggle"
            type="button"
            aria-expanded={open}
            aria-controls="lp-mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lp-mobile" id="lp-mobile-nav">
          <nav aria-label="Sections">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} onClick={() => setOpen(false)}>
                {section.label}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            ))}
          </nav>
          <Link className="lp-btn lp-btn--primary lp-btn--block" to={accessPath} onClick={() => setOpen(false)}>
            Get started <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      )}
    </header>
  );
}

/** The record's path: four stations on a lit bus above a technical floor. */
function HeroStage() {
  return (
    <div className="lp-stage" aria-hidden="true">
      <div className="lp-stage__glow" />
      <div className="lp-stage__floor" />
      <div className="lp-stage__bus">
        <span className="lp-stage__pulse" />
        <span className="lp-stage__pulse lp-stage__pulse--b" />
        <span className="lp-stage__pulse lp-stage__pulse--c" />
      </div>
      <ol className="lp-stage__stations">
        {stage.map((item) => (
          <li key={item.index} className="lp-stage__station">
            <span className="lp-stage__index">{item.index}</span>
            <span className="lp-stage__label">
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </span>
            <span className="lp-stage__stem" />
            <span className="lp-stage__node" />
          </li>
        ))}
      </ol>
    </div>
  );
}

function Kicker({ index, children, light = false }: { index: string; children: ReactNode; light?: boolean }) {
  return (
    <p className={`lp-kicker${light ? ' lp-kicker--light' : ''}`}>
      <span className="lp-kicker__index">{index}</span>
      <span className="lp-kicker__label">{children}</span>
    </p>
  );
}

export function LandingPage() {
  useScrollReveal();
  const heroRef = useRef<HTMLElement>(null);

  // One passive scroll listener drives a single custom property, which the
  // atmosphere layers translate by a few pixels. No listener at all under
  // reduced motion, so the composition is identical and still.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      hero.style.setProperty('--hero-shift', Math.min(window.scrollY / 760, 1).toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      hero.style.removeProperty('--hero-shift');
    };
  }, []);

  return (
    <div className="lp" id="top">
      <a className="skip-link" href="#landing-main">Skip to content</a>
      <LandingHeader />

      <main id="landing-main">
        <section className="lp-hero" ref={heroRef} aria-labelledby="lp-hero-title">
          <div className="lp-hero__sky" aria-hidden="true">
            <span className="lp-hero__tube" />
            <span className="lp-hero__wash" />
            <span className="lp-hero__bloom lp-hero__bloom--a" />
            <span className="lp-hero__bloom lp-hero__bloom--b" />
            <span className="lp-hero__grain" />
          </div>

          <div className="lp-hero__inner">
            <p className="lp-eyebrow">
              <span className="lp-eyebrow__dot" aria-hidden="true" />
              APAAR-based student data management &amp; verification
            </p>

            <h1 className="lp-hero__title" id="lp-hero-title">
              <span className="sr-only">Sudharshan: </span>
              <span className="lp-hero__wordmark" aria-hidden="true">
                <TechText
                  text="Sudharshan"
                  fontWeight={700}
                  fontSize={200}
                  align="center"
                  accentColor="#2fd0bc"
                  reveal="letter"
                  specks={12}
                  clickKick
                  guides={false}
                />
              </span>
              <span className="lp-hero__headline">
                Verify. Validate. <em>See the full picture.</em>
              </span>
            </h1>

            <p className="lp-hero__lede">
              Institutions submit enrolment records, validation catches what does not reconcile, and students confirm
              their own details, giving AICTE auditable visibility into enrolment as it actually stands.
            </p>

            <div className="lp-hero__actions">
              <Link className="lp-btn lp-btn--primary" to={accessPath}>
                Get started <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <a className="lp-btn lp-btn--ghost" href="#our-method">
                How it works <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>

            <p className="lp-hero__meta">
              <span>SIH26263</span>
              <span className="lp-hero__dot" aria-hidden="true" />
              <span>Prototype environment</span>
              <span className="lp-hero__dot" aria-hidden="true" />
              <span>Institution · Student · AICTE</span>
            </p>
          </div>

          <HeroStage />
        </section>

        <section className="lp-section lp-build" id="what-we-build" aria-labelledby="lp-build-title">
          <div className="lp-shell lp-build__grid">
            <div className="lp-build__aside" data-reveal>
              <Kicker index="01">What we build</Kicker>
              <h2 className="lp-h2" id="lp-build-title">
                Infrastructure for a record that can be trusted.
              </h2>
              <p className="lp-lede">
                Five surfaces, one record. Each is represented by a prototype interface; no production data, identity
                service or verification provider is connected.
              </p>
              <a className="lp-link" href="#our-method">
                See the method <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>

            <ol className="lp-build__list">
              {capabilities.map((item, index) => (
                <li className="lp-build__row" key={item.index} data-reveal style={reveal(index * 60)}>
                  <span className="lp-build__index">{item.index}</span>
                  <div className="lp-build__body">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                  <span className={`lp-tag${item.tag === 'Planned' ? ' lp-tag--planned' : ''}`}>{item.tag}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lp-section lp-section--dark lp-method" id="our-method" aria-labelledby="lp-method-title">
          <div className="lp-method__weave" aria-hidden="true">
            <WebThreads
              colors={['#0d8f83', '#2fd0bc', '#4fc3d6', '#6fb3e8']}
              coreColor="#2fd0bc"
              backgroundColor="transparent"
              threadCount={6}
              speed={0.12}
              frequency={4}
              spread={0.16}
              position={0.42}
              pinch={0.5}
              glow={0.05}
              thickness={1}
              opacity={0.42}
              fade={0.42}
              grain={0.015}
              mouseInteraction
              mouseStrength={0.3}
            />
          </div>

          <div className="lp-shell lp-method__inner">
            <header className="lp-method__head" data-reveal>
              <Kicker index="02" light>
                Our method
              </Kicker>
              <h2 className="lp-h2 lp-h2--light" id="lp-method-title">
                Five stages. Each one leaves a trace.
              </h2>
              <p className="lp-lede lp-lede--light">
                A record only moves forward once the stage behind it is settled, so every stage stays visible to the
                people who have to trust it.
              </p>
            </header>

            <ol className="lp-method__steps">
              {method.map((step, index) => (
                <li className="lp-method__step" key={step.title} data-reveal style={reveal(index * 70)}>
                  <span className="lp-method__num">{String(index + 1).padStart(2, '0')}</span>
                  <span className="lp-method__marker" aria-hidden="true">
                    <span />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  <span className={`lp-tag lp-tag--onDark${step.tag === 'Planned' ? ' lp-tag--plannedDark' : ''}`}>
                    {step.tag}
                  </span>
                </li>
              ))}
            </ol>

            <p className="lp-note">
              Prototype boundary: no submission, rule engine, notification, identity service or verification provider
              is connected to this build. Stages and states are illustrative.
            </p>
          </div>
        </section>

        <section className="lp-section lp-who" id="who-we-are" aria-labelledby="lp-who-title">
          <div className="lp-shell">
            <Kicker index="03">Who we are</Kicker>
            <h2 className="lp-who__statement" id="lp-who-title" data-reveal>
              A record is only trustworthy when the institution that submits it and the student it describes agree on
              it.
            </h2>

            <div className="lp-who__columns">
              <div className="lp-who__copy" data-reveal style={reveal(60)}>
                <p>
                  Institutions submit student information, but fragmented or difficult-to-authenticate records make it
                  hard to establish a reliable view of actual enrolment. The evidence exists; it is simply spread
                  across formats, offices and versions.
                </p>
                <p>
                  Sudharshan is designed so that structured institutional submission, student confirmation and
                  validation sit inside the same record, and every step leaves something reviewable behind.
                </p>
              </div>

              <ul className="lp-principles">
                {principles.map(([title, body], index) => (
                  <li key={title} data-reveal style={reveal(index * 50)}>
                    <span className="lp-principles__index">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="lp-section lp-thinking" id="thinking" aria-labelledby="lp-thinking-title">
          <div className="lp-shell">
            <header className="lp-thinking__head" data-reveal>
              <Kicker index="04">Thinking</Kicker>
              <h2 className="lp-h2" id="lp-thinking-title">
                Notes on records that have to hold.
              </h2>
            </header>

            <div className="lp-thinking__grid">
              {notes.map((note, index) => (
                <article
                  className={`lp-note-card${index === 0 ? ' lp-note-card--lead' : ''}`}
                  key={note.title}
                  data-reveal
                  style={reveal(index * 90)}
                >
                  <p className="lp-note-card__meta">{note.meta}</p>
                  <h3>{note.title}</h3>
                  <p className="lp-note-card__body">{note.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-section--dark lp-contact" id="contact" aria-labelledby="lp-contact-title">
          <div className="lp-shell lp-contact__grid">
            <div data-reveal>
              <Kicker index="05" light>
                Contact
              </Kicker>
              <h2 className="lp-h2 lp-h2--light" id="lp-contact-title">
                Start with the record you already have.
              </h2>
              <p className="lp-lede lp-lede--light">
                Sudharshan is a prototype prepared for SIH26263. The fastest way to understand it is to walk the
                institution and student flows yourself.
              </p>
              <div className="lp-contact__actions">
                <Link className="lp-btn lp-btn--primary" to={accessPath}>
                  Get started <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
                <Link className="lp-btn lp-btn--ghost" to="/about">
                  Read the platform note
                </Link>
              </div>
            </div>

            <div className="lp-contact__aside" data-reveal style={reveal(80)}>
              <dl>
                <div>
                  <dt>Environment</dt>
                  <dd>Prototype</dd>
                </div>
                <div>
                  <dt>Reference</dt>
                  <dd>SIH26263</dd>
                </div>
                <div>
                  <dt>Channel</dt>
                  <dd className="lp-contact__pending">Not connected</dd>
                </div>
              </dl>
              <p className="lp-contact__note">
                No email address, phone number or enquiry form is wired to a service in this build. The pages below
                are the honest routes in.
              </p>
              <nav className="lp-contact__links" aria-label="Contact options">
                <Link to="/contact">
                  Contact page <ArrowRight size={13} aria-hidden="true" />
                </Link>
                <Link to="/security">
                  Security principles <ArrowRight size={13} aria-hidden="true" />
                </Link>
                <Link to="/login">
                  Sign in <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </nav>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-shell">
          <div className="lp-footer__top">
            <div className="lp-footer__brand">
              <Brand tone="inverse" />
              <p>
                APAAR-based student data management and verification. A prototype interface for SIH26263. No
                production service is connected.
              </p>
            </div>

            <div className="lp-footer__cols">
              <nav aria-label="Sections">
                <h2>Sections</h2>
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    {section.label}
                  </a>
                ))}
              </nav>
              <nav aria-label="Platform">
                <h2>Platform</h2>
                <Link to={accessPath}>Institution portal</Link>
                <Link to={accessPath}>Student portal</Link>
                <Link to={accessPath}>AICTE oversight</Link>
              </nav>
              <nav aria-label="Legal and information">
                <h2>Information</h2>
                <Link to="/about">About</Link>
                <Link to="/security">Security</Link>
                <Link to="/privacy">Privacy</Link>
                <Link to="/terms">Terms</Link>
                <Link to="/cookies">Cookies</Link>
                <Link to="/contact">Contact</Link>
              </nav>
            </div>
          </div>

          <div className="lp-footer__base">
            <span>Prototype interface · SIH26263</span>
            <span>No production authentication or data service connected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
