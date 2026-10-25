import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './layout';
import {
  AboutPage,
  ContactPage,
  LegalPage,
  LoginPage,
  NotFoundPage,
  RoleAccessPage,
  RolePage,
  SecurityPage,
} from './pages';
import { LandingPage } from './landing';
import { PublicFooter } from './components';
import type { Role } from './types';

// The landing page carries its own footer, so the shared one is only added to
// the secondary public pages.
function PublicLayout() {
  const { pathname } = useLocation();
  return <><Outlet />{pathname !== '/' && <PublicFooter />}</>;
}

function RoutedRole({ role }: { role: Role }) {
  return <AppShell role={role}><RolePage role={role} /></AppShell>;
}

function RouteFallback() {
  const location = useLocation();
  return <NotFoundPage path={location.pathname} />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/prototype/access" element={<RoleAccessPage />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="/cookies" element={<LegalPage kind="cookies" />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route path="/aicte/*" element={<RoutedRole role="aicte" />} />
        <Route path="/college/*" element={<RoutedRole role="college" />} />
        <Route path="/student/*" element={<RoutedRole role="student" />} />
        <Route path="*" element={<RouteFallback />} />
      </Routes>
    </BrowserRouter>
  );
}
