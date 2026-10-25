import { useEffect, useRef, useState, type Ref } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, LogOut, Menu, X } from 'lucide-react';
import { Brand } from './components';
import { navigation, roleDetails, routeInfo } from './data/demo';
import type { Role } from './types';

type SidebarProps = {
  role: Role;
  open: boolean;
  compact: boolean;
  onClose: () => void;
  drawerRef: Ref<HTMLElement>;
};

export function Sidebar({ role, open, compact, onClose, drawerRef }: SidebarProps) {
  const location = useLocation();
  const detail = roleDetails[role];
  return (
    <aside
      ref={drawerRef}
      id="role-navigation"
      className={`app-sidebar${open ? ' app-sidebar--open' : ''}`}
      aria-label={`${detail.label} navigation`}
      aria-hidden={compact && !open}
      aria-modal={compact && open ? true : undefined}
      role={compact && open ? 'dialog' : undefined}
      inert={compact && !open}
    >
      <div className="sidebar-brand"><Link to={`/${role}`} aria-label={`${detail.label} dashboard`}><Brand /></Link><span className="prototype-tag">PROTOTYPE</span><button className="sidebar-close icon-button" type="button" aria-label="Close navigation" onClick={onClose}><X size={18} /></button></div>
      <p className="sidebar-section-label">WORKSPACE</p>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation[role].map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path || (path !== `/${role}` && location.pathname.startsWith(`${path}/`));
          return <Link key={path} to={path} className={`sidebar-link${active ? ' sidebar-link--active' : ''}`} aria-current={active ? 'page' : undefined}><Icon size={17} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>{active && <span className="sidebar-link__active-mark" aria-hidden="true" />}</Link>;
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-role"><span className="sidebar-role__symbol" aria-hidden="true">{detail.label.slice(0, 1)}</span><div><strong>{detail.label}</strong><span>Prototype role</span></div></div>
        <Link to="/prototype/access" className="sidebar-exit"><LogOut size={15} aria-hidden="true" /> Switch prototype role</Link>
        <Link to="/" className="sidebar-home"><ArrowLeft size={14} aria-hidden="true" /> Public platform page</Link>
      </div>
    </aside>
  );
}

export function Breadcrumbs({ role, title }: { role: Role; title: string }) {
  return (
    <nav className="topbar__breadcrumbs" aria-label="Breadcrumb">
      <Link to={`/${role}`}>Workspace</Link><ChevronRight size={14} aria-hidden="true" />
      <span aria-current="page">{title}</span>
    </nav>
  );
}

type TopBarProps = {
  role: Role;
  title: string;
  menuOpen: boolean;
  onMenuToggle: () => void;
  menuButtonRef: Ref<HTMLButtonElement>;
};

export function TopBar({ role, title, menuOpen, onMenuToggle, menuButtonRef }: TopBarProps) {
  return (
    <header className="topbar">
      <button ref={menuButtonRef} className="topbar__menu icon-button" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="role-navigation" onClick={onMenuToggle}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      <Breadcrumbs role={role} title={title} />
      <div className="topbar__status"><span className="topbar__status-dot" aria-hidden="true" /> Demo environment</div>
      <Link className="topbar__back" to="/prototype/access">Change role <ArrowLeft size={14} aria-hidden="true" /></Link>
    </header>
  );
}

export function AppShell({ role, children }: { role: Role; children: import('react').ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(() => window.matchMedia('(max-width: 850px)').matches);
  const location = useLocation();
  const detail = roleDetails[role];
  const page = routeInfo[location.pathname] ?? { title: detail.dashboard, description: '' };
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 850px)');
    const updateCompact = () => setIsCompact(query.matches);
    query.addEventListener('change', updateCompact);
    return () => query.removeEventListener('change', updateCompact);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (!menuOpen) {
      if (wasOpenRef.current) menuButtonRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;
    const drawer = drawerRef.current;
    const focusable = () => Array.from(drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
    focusable()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar role={role} open={menuOpen} compact={isCompact} onClose={() => setMenuOpen(false)} drawerRef={drawerRef} />
      {menuOpen && <button className="mobile-scrim" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className="app-workspace">
        <TopBar role={role} title={page.title} menuOpen={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} menuButtonRef={menuButtonRef} />
        <main id="main-content" className="main-content" tabIndex={-1}>{children}</main>
        <footer className="app-footer"><span>SIH26263 · Prototype interface</span><span>Demo content only. No production service is connected.</span></footer>
      </div>
    </div>
  );
}
