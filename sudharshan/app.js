/**
 * Sudharshan - APAAR-based Student Data Management & Verification System
 * SIH26263 Prototype Platform
 * Verification & Trust Prototype Platform
 */

(function () {
  // Current active path
  let currentPath = window.location.pathname || "/";
  if (window.location.hash) {
    currentPath = window.location.hash.replace(/^#/, "") || "/";
  }

  // Navigation Helper
  window.navigateTo = function (path) {
    currentPath = path;
    window.location.hash = path;
    renderApp();
    window.scrollTo(0, 0);
  };

  window.addEventListener("hashchange", () => {
    currentPath = window.location.hash.replace(/^#/, "") || "/";
    renderApp();
  });

  // Navigation Links Definition matching Sudharshan
  const navStructure = {
    aicte: [
      { path: "/aicte", label: "Dashboard", icon: "grid" },
      { path: "/aicte/institutions", label: "Institutions", icon: "building" },
      { path: "/aicte/students", label: "Student Records", icon: "users" },
      { path: "/aicte/warnings", label: "Flagged Warnings", icon: "alert-triangle" },
      { path: "/aicte/review", label: "Review Queue", icon: "check-square" },
      { path: "/aicte/risk", label: "Risk Analytics", icon: "trending-up" },
      { path: "/aicte/audit", label: "Audit & Tamper Proof", icon: "shield", badge: "Trust Layer" },
      { path: "/aicte/reports", label: "Reports", icon: "file-text" },
      { path: "/aicte/verification", label: "Verification Console", icon: "qr-code", badge: "Active" },
      { path: "/aicte/settings", label: "Settings", icon: "settings" }
    ],
    college: [
      { path: "/college", label: "Dashboard", icon: "grid" },
      { path: "/college/students", label: "Student Records", icon: "users" },
      { path: "/college/students/add", label: "Add Student", icon: "user-plus" },
      { path: "/college/students/upload", label: "Upload Students", icon: "upload" },
      { path: "/college/validation", label: "Validation Results", icon: "check-circle" },
      { path: "/college/flagged", label: "Flagged Records", icon: "flag" },
      { path: "/college/submission", label: "Submission Status", icon: "send" },
      { path: "/college/confirmation", label: "Student Confirmation", icon: "check" },
      { path: "/college/credentials", label: "QR / Credentials", icon: "award", badge: "Verified" },
      { path: "/college/activity", label: "Audit / Activity", icon: "clock", badge: "Chained" },
      { path: "/college/settings", label: "Settings", icon: "settings" }
    ],
    student: [
      { path: "/student/profile", label: "My Profile", icon: "user" },
      { path: "/student/academic-record", label: "My Academic Record", icon: "book-open" },
      { path: "/student/verification", label: "Verification Status", icon: "shield-check", badge: "Verified" },
      { path: "/student/activity", label: "Data Activity", icon: "activity" },
      { path: "/student/qr", label: "My QR Pass", icon: "qr-code", badge: "Scannable" },
      { path: "/student/consent", label: "DPDP Consent", icon: "lock", badge: "Privacy" },
      { path: "/student/documents", label: "Documents", icon: "file" },
      { path: "/student/notifications", label: "Notifications", icon: "bell" },
      { path: "/student/verification-history", label: "Verification History", icon: "history" },
      { path: "/student/settings", label: "Settings", icon: "settings" }
    ]
  };

  // SVG Icon Helper
  function getIcon(name, size = 18) {
    const icons = {
      grid: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      building: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="15" y2="18"/></svg>`,
      users: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      "alert-triangle": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      "check-square": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      "trending-up": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
      shield: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      "shield-check": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
      "file-text": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      "qr-code": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/><path d="M20 14v3"/><path d="M14 20h3"/><path d="M20 20h.01"/></svg>`,
      settings: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      "user-plus": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
      upload: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
      "check-circle": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      flag: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
      send: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
      check: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
      award: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
      clock: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      user: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      "book-open": `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
      activity: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      lock: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      file: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
      bell: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
      history: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/><polyline points="12 7 12 12 15 15"/></svg>`
    };
    return icons[name] || icons.shield;
  }

  // Master Render Function
  function renderApp() {
    const root = document.getElementById("root");
    if (!root) return;

    // Determine current role & view
    const isAicte = currentPath.startsWith("/aicte");
    const isCollege = currentPath.startsWith("/college");
    const isStudent = currentPath.startsWith("/student");
    const isVerify = currentPath.startsWith("/verify");
    const isWorkspace = isAicte || isCollege || isStudent;

    let role = "aicte";
    if (isCollege) role = "college";
    if (isStudent) role = "student";

    // Top Demo Navigation Bar (One-click access for judges and user)
    const demoBannerHtml = `
      <div style="background: #111e1c; color: #f4f4ec; padding: 10px 24px; font-size: 0.82rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #233c38; flex-wrap: wrap; gap: 10px; z-index: 9999;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="background: var(--sand); color: #000; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; letter-spacing: 0.05em;">
            TRUST SUITE
          </span>
          <strong style="color: #ffffff;">SIH26263 Verification + Trust System:</strong>
        </div>
        
        <div class="demo-stepper" style="margin: 0; padding: 0; background: transparent; border: none;">
          <button class="demo-step-btn ${currentPath === '/college/credentials' ? 'demo-step-btn--active' : ''}" onclick="navigateTo('/college/credentials')">
            1. Issue Credential
          </button>
          <button class="demo-step-btn ${currentPath === '/student/qr' ? 'demo-step-btn--active' : ''}" onclick="navigateTo('/student/qr')">
            2. Student QR Pass
          </button>
          <button class="demo-step-btn ${currentPath === '/student/consent' ? 'demo-step-btn--active' : ''}" onclick="navigateTo('/student/consent')">
            3. DPDP Consent
          </button>
          <button class="demo-step-btn ${currentPath.startsWith('/verify') ? 'demo-step-btn--active' : ''}" onclick="navigateTo('/verify')">
            4. Employer Checkpoint
          </button>
          <button class="demo-step-btn ${currentPath === '/aicte/audit' ? 'demo-step-btn--active' : ''}" onclick="navigateTo('/aicte/audit')">
            5. Hash Chain & Tamper
          </button>
        </div>
      </div>
    `;

    // Global Header
    const headerHtml = `
      <header class="lp-header" style="background: #ffffff; border-bottom: 1px solid var(--line);">
        <div class="lp-header__inner" style="max-width: 1300px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 14px 24px;">
          <a href="#" onclick="navigateTo('/'); return false;" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
            <img src="apaar-mark.svg" alt="APAAR Logo" style="width: 34px; height: 34px;">
            <div>
              <span class="eyebrow" style="margin: 0; font-size: 0.65rem; letter-spacing: 0.1em; color: var(--accent);">APAAR-BASED RECORDS</span>
              <strong style="display: block; font-size: 1.15rem; font-weight: 800; color: var(--ink); letter-spacing: -0.01em;">SUDHARSHAN</strong>
            </div>
          </a>

          <nav class="lp-nav" style="display: flex; align-items: center; gap: 20px;">
            <a href="#" onclick="navigateTo('/'); return false;" class="lp-nav__link ${currentPath === '/' ? 'active' : ''}" style="color: var(--ink); font-weight: 500; text-decoration: none; font-size: 0.9rem;">Platform</a>
            <a href="#" onclick="navigateTo('/about'); return false;" class="lp-nav__link ${currentPath === '/about' ? 'active' : ''}" style="color: var(--ink); font-weight: 500; text-decoration: none; font-size: 0.9rem;">About</a>
            <a href="#" onclick="navigateTo('/security'); return false;" class="lp-nav__link ${currentPath === '/security' ? 'active' : ''}" style="color: var(--ink); font-weight: 500; text-decoration: none; font-size: 0.9rem;">Security</a>
            <a href="#" onclick="navigateTo('/verify'); return false;" class="lp-nav__link ${currentPath.startsWith('/verify') ? 'active' : ''}" style="color: var(--accent); font-weight: 700; text-decoration: none; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
              Employer Checkpoint
            </a>
          </nav>

          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="display: flex; background: var(--canvas); border: 1px solid var(--line); border-radius: 6px; padding: 2px;">
              <button class="button button--small ${isAicte ? 'button--primary' : 'button--secondary'}" style="padding: 6px 12px; font-size: 0.78rem;" onclick="navigateTo('/aicte')">AICTE</button>
              <button class="button button--small ${isCollege ? 'button--primary' : 'button--secondary'}" style="padding: 6px 12px; font-size: 0.78rem;" onclick="navigateTo('/college')">College</button>
              <button class="button button--small ${isStudent ? 'button--primary' : 'button--secondary'}" style="padding: 6px 12px; font-size: 0.78rem;" onclick="navigateTo('/student/profile')">Student</button>
            </div>
          </div>
        </div>
      </header>
    `;

    // If it's a Workspace route (/aicte/*, /college/*, /student/*)
    if (isWorkspace) {
      const links = navStructure[role] || navStructure.aicte;

      root.innerHTML = `
        ${demoBannerHtml}
        ${headerHtml}
        <div class="workspace-layout" style="display: flex; min-height: calc(100vh - 120px); max-width: 1400px; margin: 0 auto;">
          
          <!-- Sidebar Navigation -->
          <aside class="workspace-sidebar" style="width: 250px; background: #ffffff; border-right: 1px solid var(--line); padding: 24px 16px; flex-shrink: 0;">
            <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--line);">
              <span class="eyebrow" style="margin: 0; font-size: 0.65rem;">ACTIVE WORKSPACE</span>
              <strong style="display: block; font-size: 1.05rem; color: var(--accent); text-transform: uppercase;">
                ${role === 'aicte' ? 'AICTE Central Oversight' : role === 'college' ? 'Institution Portal' : 'Student Portal'}
              </strong>
            </div>

            <nav style="display: flex; flex-direction: column; gap: 4px;">
              ${links.map(l => `
                <a href="#" onclick="navigateTo('${l.path}'); return false;" class="sidebar-link ${currentPath === l.path ? 'sidebar-link--active' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 6px; text-decoration: none; color: ${currentPath === l.path ? 'var(--accent)' : 'var(--ink)'}; background: ${currentPath === l.path ? 'var(--accent-soft)' : 'transparent'}; font-size: 0.88rem; font-weight: ${currentPath === l.path ? '600' : 'normal'}; transition: all 0.15s ease;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    ${getIcon(l.icon)}
                    <span>${l.label}</span>
                  </div>
                  ${l.badge ? `<span style="font-size: 0.65rem; background: #155b58; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-weight: 700;">${l.badge}</span>` : ''}
                </a>
              `).join('')}
            </nav>
          </aside>

          <!-- Main Workspace Content Area -->
          <main class="workspace-main-content" style="flex: 1; padding: 32px 40px; background: var(--canvas); min-width: 0;">
          </main>

        </div>
      `;

      // Render the specific View inside workspace-main-content
      const mainContainer = document.querySelector(".workspace-main-content");
      dispatchWorkspaceView(mainContainer, currentPath, role);
      return;
    }

    // Public / Standalone Views (Landing Page, /verify, /about, /security)
    root.innerHTML = `
      ${demoBannerHtml}
      ${headerHtml}
      <main id="public-main-content" style="min-height: calc(100vh - 120px); background: #ffffff;">
      </main>
      ${renderPublicFooter()}
    `;

    const publicContainer = document.getElementById("public-main-content");
    dispatchPublicView(publicContainer, currentPath);
  }

  // Workspace View Dispatcher
  function dispatchWorkspaceView(container, path, role) {
    // 1. Verification & Credentials Features
    if (path === "/college/credentials") {
      renderCollegeCredentialsView(container);
      return;
    }
    if (path === "/student/qr") {
      renderStudentQrView(container);
      return;
    }
    if (path === "/student/consent") {
      renderStudentConsentView(container);
      return;
    }
    if (path === "/aicte/audit" || path === "/college/activity" || path === "/student/activity") {
      renderAuditTrailView(container, role);
      return;
    }
    if (path === "/aicte/verification" || path === "/student/verification") {
      renderPublicVerifierView(container, "CRED-2026-001");
      return;
    }

    // 2. Dashboards
    if (path === "/aicte") {
      renderAicteDashboard(container);
      return;
    }
    if (path === "/college") {
      renderCollegeDashboard(container);
      return;
    }
    if (path === "/student" || path === "/student/profile") {
      renderStudentProfile(container);
      return;
    }

    // 3. Student Records Table
    if (path === "/aicte/students" || path === "/college/students" || path === "/student/academic-record") {
      renderStudentsTable(container, role);
      return;
    }

    // Default Fallback
    renderPlannedArea(container, path, role);
  }

  // Public View Dispatcher
  function dispatchPublicView(container, path) {
    if (path === "/" || path === "") {
      renderLandingPage(container);
      return;
    }
    if (path.startsWith("/verify")) {
      const urlParams = new URLSearchParams(window.location.search || window.location.hash.split('?')[1]);
      const initialId = urlParams.get('id') || "CRED-2026-001";
      renderPublicVerifierView(container, initialId);
      return;
    }
    if (path === "/about") {
      renderAboutPage(container);
      return;
    }
    if (path === "/security") {
      renderSecurityPage(container);
      return;
    }
    if (path === "/login" || path === "/prototype/access") {
      renderRoleSelectionPage(container);
      return;
    }
    renderPlannedArea(container, path, "public");
  }

  // ---------------------------------------------------------------------------------
  // VIEW RENDERERS
  // ---------------------------------------------------------------------------------

  function renderLandingPage(container) {
    container.innerHTML = `
      <!-- Hero Section -->
      <section style="padding: 80px 24px 60px; max-width: 1200px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 48px; align-items: center;">
          <div>
            <span class="eyebrow" style="color: var(--accent); font-weight: 700;">SMART INDIA HACKATHON 2026 · PROBLEM STATEMENT SIH26263</span>
            <h1 style="font-size: 3.2rem; font-weight: 800; line-height: 1.1; margin: 16px 0 20px; color: var(--ink); letter-spacing: -0.02em;">
              A single, verifiable record of student enrolment.
            </h1>
            <p style="font-size: 1.25rem; color: var(--muted); line-height: 1.6; margin-bottom: 32px; max-width: 580px;">
              “Today AICTE trusts the institution’s word. We make it a handshake between the institution and the student, enforced in real time with cryptographic credentials and scannable QR verification.”
            </p>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
              <button class="button button--primary" style="padding: 14px 28px; font-size: 1rem;" onclick="navigateTo('/verify')">
                Open Employer Checkpoint
              </button>
              <button class="button button--secondary" style="padding: 14px 28px; font-size: 1rem;" onclick="navigateTo('/college/credentials')">
                Explore Credential Generator
              </button>
            </div>
          </div>

          <!-- Hero Graphic Card (Employer Checkpoint Visual) -->
          <div style="background: #ffffff; border: 1px solid var(--line); border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.06); text-align: center;">
            <img src="assets/employer-checkpoint.png" alt="Employer Checkpoint" style="width: 100%; border-radius: 8px; margin-bottom: 16px;" onerror="this.style.display='none'">
            <div style="background: var(--canvas); padding: 14px; border-radius: 8px; font-size: 0.85rem; color: var(--muted);">
              <strong>Zero-Trust Verifier Engine:</strong> Validates digital signature, checks revocation registry, and applies DPDP Act 2023 field-level consent in under 50ms.
            </div>
          </div>
        </div>
      </section>

      <!-- Key Capabilities Grid (Verification & Trust Architecture) -->
      <section style="background: var(--canvas); padding: 80px 24px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 48px;">
            <p class="eyebrow" style="color: var(--accent);">VERIFICATION + TRUST ARCHITECTURE</p>
            <h2 style="font-size: 2.2rem; font-weight: 800; color: var(--ink);">Built for End-to-End Academic Integrity</h2>
            <p style="color: var(--muted); max-width: 650px; margin: 12px auto 0;">Every layer of the verification workflow is mathematically provable, privacy-preserving, and instant.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
            <div class="panel" style="background: #fff; padding: 28px; border-radius: 12px; border: 1px solid var(--line);">
              <div style="width: 44px; height: 44px; background: #e0f2fe; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #0284c7;">
                ${getIcon('award', 24)}
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 8px;">1. Credential Generation</h3>
              <p style="color: var(--muted); font-size: 0.9rem; line-height: 1.5; margin: 0;">
                Institutions issue tamper-evident credentials cryptographically signed using ECDSA P-256 and SHA-256 against approved AICTE intake quotas.
              </p>
            </div>

            <div class="panel" style="background: #fff; padding: 28px; border-radius: 12px; border: 1px solid var(--line);">
              <div style="width: 44px; height: 44px; background: #dcfce7; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #16a34a;">
                ${getIcon('qr-code', 24)}
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 8px;">2. Dynamic QR Generation</h3>
              <p style="color: var(--muted); font-size: 0.9rem; line-height: 1.5; margin: 0;">
                Real dynamic vector SVG QR codes encoding verifiable deep links, scannable by any camera or smartphone with zero external cloud dependencies.
              </p>
            </div>

            <div class="panel" style="background: #fff; padding: 28px; border-radius: 12px; border: 1px solid var(--line);">
              <div style="width: 44px; height: 44px; background: #fef3c7; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #d97706;">
                ${getIcon('shield-check', 24)}
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 8px;">3. Instant Revocation</h3>
              <p style="color: var(--muted); font-size: 0.9rem; line-height: 1.5; margin: 0;">
                Real-time revocation ledger. If an enrolment is cancelled or duplicate seat clash is caught, scans instantly switch from VERIFIED to REVOKED.
              </p>
            </div>

            <div class="panel" style="background: #fff; padding: 28px; border-radius: 12px; border: 1px solid var(--line);">
              <div style="width: 44px; height: 44px; background: #ede9fe; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #7c3aed;">
                ${getIcon('lock', 24)}
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 8px;">4. Authorized Display (Consent)</h3>
              <p style="color: var(--muted); font-size: 0.9rem; line-height: 1.5; margin: 0;">
                DPDP Act 2023 compliant field-level consent. Students choose exactly which fields (CGPA, category, contact) an employer can inspect.
              </p>
            </div>

            <div class="panel" style="background: #fff; padding: 28px; border-radius: 12px; border: 1px solid var(--line);">
              <div style="width: 44px; height: 44px; background: #fee2e2; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #dc2626;">
                ${getIcon('shield', 24)}
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 8px;">5. Tamper Detection Engine</h3>
              <p style="color: var(--muted); font-size: 0.9rem; line-height: 1.5; margin: 0;">
                Hash-chained append-only audit trail where Block[i] = SHA256(Block[i-1] + payload). Any unauthorized database edit breaks the chain immediately.
              </p>
            </div>

            <div class="panel" style="background: #fff; padding: 28px; border-radius: 12px; border: 1px solid var(--line);">
              <div style="width: 44px; height: 44px; background: #ccfbf1; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #0d9488;">
                ${getIcon('file-text', 24)}
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 8px;">6. Certificate Printing (Req 10)</h3>
              <p style="color: var(--muted); font-size: 0.9rem; line-height: 1.5; margin: 0;">
                Generates AICTE-compliant degree certificates displaying the student's unique 12-digit APAAR ID prominently alongside their Institutional Student ID.
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderAicteDashboard(container) {
    const store = window.SudharshanTrustStore;
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <p class="eyebrow">AICTE OVERSIGHT · NATIONAL REGISTRY</p>
        <h1 style="font-size: 1.85rem; font-weight: 700; color: var(--ink); margin: 0 0 6px;">National Admissions & Verification Dashboard</h1>
        <p style="color: var(--muted); margin: 0;">Real-time oversight across approved institutions, intake quotas, and student confirmations.</p>
      </div>

      <div class="stats-grid stats-grid--three" style="margin-bottom: 28px;">
        <div class="stat-card panel">
          <span class="stat-card__label">Approved Intake Capacity</span>
          <strong class="stat-card__value">14,280</strong>
          <span class="stat-card__detail">Across 42 sampled colleges</span>
        </div>
        <div class="stat-card panel">
          <span class="stat-card__label">Student-Confirmed Enrolments</span>
          <strong class="stat-card__value" style="color: var(--success);">12,940</strong>
          <span class="stat-card__detail">90.6% independent OTP handshake</span>
        </div>
        <div class="stat-card panel">
          <span class="stat-card__label">Audit Trail Integrity</span>
          <strong class="stat-card__value" style="color: var(--accent);">100% Intact</strong>
          <span class="stat-card__detail">${store.auditTrail.length} hash-chained blocks verified</span>
        </div>
      </div>

      <div class="panel" style="background: #fff; padding: 24px; border-radius: 8px; border: 1px solid var(--line); margin-bottom: 24px;">
        <h2 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 16px;">Quick Actions & Regulatory Operations</h2>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="button button--primary" onclick="navigateTo('/aicte/audit')">
            Inspect Audit Trail & Verify Hashes →
          </button>
          <button class="button button--secondary" onclick="navigateTo('/aicte/verification')">
            Open Verification Console →
          </button>
          <button class="button button--secondary" onclick="navigateTo('/aicte/students')">
            View Student Records →
          </button>
        </div>
      </div>
    `;
  }

  function renderCollegeDashboard(container) {
    const store = window.SudharshanTrustStore;
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <p class="eyebrow">INSTITUTION PORTAL · IIT BOMBAY</p>
        <h1 style="font-size: 1.85rem; font-weight: 700; color: var(--ink); margin: 0 0 6px;">Institution Workspace</h1>
        <p style="color: var(--muted); margin: 0;">Submit student data, monitor intake limits, issue verifiable credentials, and review student confirmation status.</p>
      </div>

      <div class="stats-grid stats-grid--three" style="margin-bottom: 28px;">
        <div class="stat-card panel">
          <span class="stat-card__label">Approved Intake</span>
          <strong class="stat-card__value">1,200</strong>
          <span class="stat-card__detail">AICTE Sanctioned 2024-28</span>
        </div>
        <div class="stat-card panel">
          <span class="stat-card__label">Credentials Issued</span>
          <strong class="stat-card__value" style="color: var(--accent);">${store.credentials.length}</strong>
          <span class="stat-card__detail">With scannable QR verification</span>
        </div>
        <div class="stat-card panel">
          <span class="stat-card__label">Confirmation Status</span>
          <strong class="stat-card__value" style="color: var(--success);">98.4%</strong>
          <span class="stat-card__detail">Student confirmed via APAAR OTP</span>
        </div>
      </div>

      <div class="panel" style="background: #fff; padding: 24px; border-radius: 8px; border: 1px solid var(--line);">
        <h2 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 16px;">Credential Operations & Issuance</h2>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="button button--primary" onclick="navigateTo('/college/credentials')">
            Manage & Issue Credentials →
          </button>
          <button class="button button--secondary" onclick="navigateTo('/college/activity')">
            View Activity Log & Audit Trail →
          </button>
          <button class="button button--secondary" onclick="openIssueCredentialModal()">
            + Quick Issue Single Credential
          </button>
        </div>
      </div>
    `;
  }

  function renderStudentProfile(container) {
    const store = window.SudharshanTrustStore;
    const student = store.credentials[0];
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <p class="eyebrow">STUDENT PORTAL · MY RECORD</p>
        <h1 style="font-size: 1.85rem; font-weight: 700; color: var(--ink); margin: 0 0 6px;">Student Profile & Identity</h1>
        <p style="color: var(--muted); margin: 0;">Verified academic identity anchored to the National APAAR Registry.</p>
      </div>

      <div class="panel" style="background: #ffffff; border: 1px solid var(--line); border-radius: 12px; padding: 28px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid var(--line); padding-bottom: 20px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 56px; height: 56px; background: var(--accent-soft); color: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;">
              AS
            </div>
            <div>
              <h2 style="margin: 0; font-size: 1.4rem; color: var(--ink);">${student.name}</h2>
              <code style="font-size: 0.95rem; color: var(--accent); font-weight: 600;">APAAR ID: ${student.apaarId}</code>
            </div>
          </div>
          <span class="status-badge status-badge--success">
            <span class="status-badge__dot"></span>
            Enrolment Confirmed
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; font-size: 0.9rem;">
          <div>
            <span style="display: block; color: var(--muted); font-size: 0.75rem; text-transform: uppercase;">Institution</span>
            <strong>${student.institution}</strong>
          </div>
          <div>
            <span style="display: block; color: var(--muted); font-size: 0.75rem; text-transform: uppercase;">Programme</span>
            <strong>${student.programme}</strong>
          </div>
          <div>
            <span style="display: block; color: var(--muted); font-size: 0.75rem; text-transform: uppercase;">Institutional Roll No</span>
            <strong>${student.studentId}</strong>
          </div>
          <div>
            <span style="display: block; color: var(--muted); font-size: 0.75rem; text-transform: uppercase;">Valid Until</span>
            <strong style="color: var(--success);">${student.expiresAt.split('T')[0]}</strong>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="panel" style="background: #ffffff; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
          <h3 style="margin: 0 0 10px; font-size: 1.1rem;">My Verifiable QR Pass</h3>
          <p style="color: var(--muted); font-size: 0.85rem; margin: 0 0 16px;">Download your dynamic QR pass to present for campus access or employer checks.</p>
          <button class="button button--primary button--small" onclick="navigateTo('/student/qr')">
            Open My QR Pass →
          </button>
        </div>

        <div class="panel" style="background: #ffffff; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
          <h3 style="margin: 0 0 10px; font-size: 1.1rem;">DPDP Privacy & Consent</h3>
          <p style="color: var(--muted); font-size: 0.85rem; margin: 0 0 16px;">Configure which personal fields employers can see when they scan your QR code.</p>
          <button class="button button--secondary button--small" onclick="navigateTo('/student/consent')">
            Manage Consent Toggles →
          </button>
        </div>
      </div>
    `;
  }

  function renderStudentsTable(container, role) {
    const store = window.SudharshanTrustStore;
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <p class="eyebrow">${role.toUpperCase()} · STUDENT DATABASE</p>
        <h1 style="font-size: 1.85rem; font-weight: 700; color: var(--ink); margin: 0 0 6px;">Student Records & Enrolment Registry</h1>
        <p style="color: var(--muted); margin: 0;">APAAR-keyed student records with admission categories, quota validation, and status.</p>
      </div>

      <div class="panel" style="background: #fff; padding: 24px; border-radius: 8px; border: 1px solid var(--line);">
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--line); text-align: left; font-size: 0.8rem; color: var(--muted);">
              <th style="padding: 12px;">Student Name</th>
              <th style="padding: 12px;">APAAR ID</th>
              <th style="padding: 12px;">Programme</th>
              <th style="padding: 12px;">Quota</th>
              <th style="padding: 12px;">Confirmation</th>
              <th style="padding: 12px; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${store.credentials.map(c => `
              <tr style="border-bottom: 1px solid var(--line); font-size: 0.9rem;">
                <td style="padding: 12px;"><strong>${c.name}</strong><br><small style="color: var(--muted);">${c.studentId}</small></td>
                <td style="padding: 12px;"><code style="color: var(--accent); font-weight: 600;">${c.apaarId}</code></td>
                <td style="padding: 12px;">${c.programme}</td>
                <td style="padding: 12px;">${c.quota}</td>
                <td style="padding: 12px;"><span class="status-badge status-badge--${c.status === 'ACTIVE' ? 'success' : c.status === 'REVOKED' ? 'danger' : 'warning'}">${c.status}</span></td>
                <td style="padding: 12px; text-align: right;">
                  <button class="button button--small button--secondary" onclick="openCredentialCertificate('${c.id}')">View</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderAboutPage(container) {
    container.innerHTML = `
      <div style="max-width: 850px; margin: 40px auto; padding: 0 24px;">
        <p class="eyebrow">ABOUT SUDHARSHAN</p>
        <h1 style="font-size: 2.4rem; font-weight: 800; margin: 0 0 16px;">APAAR-Based Student Data Management & Verification</h1>
        <p style="font-size: 1.1rem; line-height: 1.6; color: var(--muted); margin-bottom: 30px;">
          Developed for AICTE Problem Statement SIH26263. Sudharshan bridges the trust gap between institution-reported admissions and student reality through cryptographic verification and student-confirmed enrolment.
        </p>
        <div class="panel" style="background: var(--canvas); padding: 24px; border-radius: 8px; border: 1px solid var(--line);">
          <h3 style="margin-top: 0;">Our Hero USP: Student-Confirmed Enrolment</h3>
          <p style="color: var(--muted); line-height: 1.6;">
            Today AICTE only receives aggregate totals from non-PGDM colleges. Sudharshan enforces post-admission student-level data submissions linked to the 12-digit APAAR ID. Students confirm their seat via mobile OTP, making ghost admissions and dual enrolment clashes immediately detectable.
          </p>
        </div>
      </div>
    `;
  }

  function renderSecurityPage(container) {
    container.innerHTML = `
      <div style="max-width: 850px; margin: 40px auto; padding: 0 24px;">
        <p class="eyebrow">SECURITY & PRIVACY PRINCIPLES</p>
        <h1 style="font-size: 2.4rem; font-weight: 800; margin: 0 0 16px;">Zero-Trust & DPDP Act 2023 Compliance</h1>
        <p style="font-size: 1.1rem; line-height: 1.6; color: var(--muted); margin-bottom: 30px;">
          Architected following India’s Digital Personal Data Protection Act 2023 with purpose limitation, data minimisation, and cryptographic tamper evidence.
        </p>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="panel" style="padding: 24px; border: 1px solid var(--line); border-radius: 8px;">
            <h3 style="margin: 0 0 8px;">1. Hash-Chained Audit Trail</h3>
            <p style="margin: 0; color: var(--muted);">Every database action is hashed with SHA-256 and chained to the previous block. Direct database alterations break the chain immediately.</p>
          </div>
          <div class="panel" style="padding: 24px; border: 1px solid var(--line); border-radius: 8px;">
            <h3 style="margin: 0 0 8px;">2. Field-Level Consent Matrix</h3>
            <p style="margin: 0; color: var(--muted);">Students hold the cryptographic keys to their personal data. Sensitive fields like CGPA, category, and mobile numbers are withheld or masked unless consented.</p>
          </div>
          <div class="panel" style="padding: 24px; border: 1px solid var(--line); border-radius: 8px;">
            <h3 style="margin: 0 0 8px;">3. Cryptographic Signatures (ES256 / Ed25519)</h3>
            <p style="margin: 0; color: var(--muted);">All issued credentials carry an ECDSA P-256 digital signature anchor verified against the AICTE root authority certificate.</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderRoleSelectionPage(container) {
    container.innerHTML = `
      <div style="max-width: 650px; margin: 60px auto; padding: 0 24px; text-align: center;">
        <p class="eyebrow">PROTOTYPE ENTRY</p>
        <h1 style="font-size: 2.2rem; font-weight: 800; margin: 0 0 12px;">Choose Your Prototype Role</h1>
        <p style="color: var(--muted); margin-bottom: 36px;">Select an interface to explore the student enrolment and verification lifecycle.</p>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <button class="button button--primary" style="padding: 16px; font-size: 1rem; justify-content: center;" onclick="navigateTo('/aicte')">
            AICTE Central Directorate Dashboard →
          </button>
          <button class="button button--secondary" style="padding: 16px; font-size: 1rem; justify-content: center;" onclick="navigateTo('/college')">
            Institution Official Workspace (IIT Bombay) →
          </button>
          <button class="button button--secondary" style="padding: 16px; font-size: 1rem; justify-content: center;" onclick="navigateTo('/student/profile')">
            Student Enrolment & Consent Portal (Aarav Sharma) →
          </button>
          <button class="button" style="padding: 16px; font-size: 1rem; justify-content: center; background: #10b981; color: #fff; border: none;" onclick="navigateTo('/verify')">
            Employer & Regulatory Checkpoint (Public Scan) →
          </button>
        </div>
      </div>
    `;
  }

  function renderPlannedArea(container, path, role) {
    container.innerHTML = `
      <div class="panel" style="padding: 40px; text-align: center; border: 1px solid var(--line); border-radius: 12px; background: #fff;">
        <p class="eyebrow">${role.toUpperCase()} · MODULE</p>
        <h2 style="font-size: 1.5rem; margin: 0 0 12px;">${path}</h2>
        <p style="color: var(--muted); margin: 0 0 24px;">This module is part of the SIH26263 platform scope.</p>
        <button class="button button--primary" onclick="navigateTo('/college/credentials')">
          Explore Credentials & Trust Suite →
        </button>
      </div>
    `;
  }

  function renderPublicFooter() {
    return `
      <footer class="lp-footer" style="background: #111e1c; color: #f4f4ec; padding: 48px 24px; border-top: 1px solid #233c38;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
          <div>
            <strong style="font-size: 1.1rem; color: #fff;">SUDHARSHAN</strong>
            <p style="color: #8fa09d; font-size: 0.85rem; margin: 4px 0 0;">
              APAAR-based Student Data Management & Verification System · SIH26263 Prototype
            </p>
          </div>
          <div style="display: flex; gap: 20px; font-size: 0.85rem;">
            <a href="#" onclick="navigateTo('/'); return false;" style="color: #cbd5e1; text-decoration: none;">Home</a>
            <a href="#" onclick="navigateTo('/verify'); return false;" style="color: #cbd5e1; text-decoration: none;">Employer Checkpoint</a>
            <a href="#" onclick="navigateTo('/college/credentials'); return false;" style="color: #cbd5e1; text-decoration: none;">Credentials</a>
            <a href="#" onclick="navigateTo('/aicte/audit'); return false;" style="color: #cbd5e1; text-decoration: none;">Tamper Detection</a>
          </div>
        </div>
      </footer>
    `;
  }

  // Initial Boot
  window.addEventListener("DOMContentLoaded", () => {
    renderApp();
  });

  // If DOM is already loaded
  if (document.readyState === "complete" || document.readyState === "interactive") {
    renderApp();
  }
})();

