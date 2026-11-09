/**
 * Sudharshan Trust & Verification UI Components
 * Interactive interfaces for Credential Generation, QR Verification, Consent, Audit Chain, and Tamper Detection
 */

// Helper to generate SVG QR Code using qrcode-generator
function renderQrCodeSvg(text, size = 180, isRevoked = false) {
  try {
    if (typeof qrcode === 'undefined') {
      return `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:#eee;border-radius:8px;font-size:11px;font-family:monospace;">QR Code: ${text}</div>`;
    }
    const typeNumber = 0; // auto
    const errorCorrectionLevel = 'M';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(text);
    qr.make();
    
    // Generate SVG string
    const moduleCount = qr.getModuleCount();
    const cellSize = size / moduleCount;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="border-radius: 8px;">`;
    svg += `<rect width="${size}" height="${size}" fill="#ffffff"/>`;
    
    const darkColor = isRevoked ? "#475569" : "#155b58";
    
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.isDark(r, c)) {
          svg += `<rect x="${(c * cellSize).toFixed(2)}" y="${(r * cellSize).toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="${darkColor}"/>`;
        }
      }
    }
    svg += '</svg>';
    return svg;
  } catch (e) {
    console.error("QR Generation error:", e);
    return `<div style="width:${size}px;height:${size}px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:12px;">QR Error</div>`;
  }
}

// 1. College Credentials View Component
function renderCollegeCredentialsView(container) {
  const store = window.SudharshanTrustStore;
  
  let html = `
    <div class="page-header" style="margin-bottom: 24px;">
      <p class="eyebrow">COLLEGE OFFICIAL · VERIFICATION & CREDENTIALS</p>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px;">
        <div>
          <h1 style="font-size: 1.85rem; font-weight: 700; color: var(--ink); margin: 0 0 6px;">Credential Issuance & Registry</h1>
          <p style="color: var(--muted); margin: 0; max-width: 650px;">Generate, sign, monitor, and revoke verifiable academic credentials linked to students' APAAR IDs.</p>
        </div>
        <button id="btn-open-issue-modal" class="button button--primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Issue New Credential
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid stats-grid--three" style="margin-bottom: 28px;">
      <div class="stat-card panel">
        <span class="stat-card__label">Total Issued</span>
        <strong class="stat-card__value" id="stat-total">${store.credentials.length}</strong>
        <span class="stat-card__detail">Cryptographically signed</span>
      </div>
      <div class="stat-card panel">
        <span class="stat-card__label">Active & Valid</span>
        <strong class="stat-card__value" style="color: var(--success);" id="stat-active">${store.credentials.filter(c => c.status === 'ACTIVE').length}</strong>
        <span class="stat-card__detail">Scannable by employers</span>
      </div>
      <div class="stat-card panel">
        <span class="stat-card__label">Revoked / Disputed</span>
        <strong class="stat-card__value" style="color: var(--danger);" id="stat-revoked">${store.credentials.filter(c => c.status === 'REVOKED').length}</strong>
        <span class="stat-card__detail">Flagged in real-time</span>
      </div>
    </div>

    <!-- Credentials Table -->
    <div class="panel" style="padding: 24px; border: 1px solid var(--line); border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <h2 style="font-size: 1.2rem; font-weight: 600; margin: 0;">Issued Verifiable Credentials</h2>
        <span style="font-size: 0.8rem; color: var(--muted); font-family: 'IBM Plex Mono', monospace;">Algorithm: ECDSA P-256 / SHA-256</span>
      </div>

      <div style="overflow-x: auto;">
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--line); text-align: left; font-size: 0.8rem; color: var(--muted); text-transform: uppercase;">
              <th style="padding: 12px 14px;">Credential & Student</th>
              <th style="padding: 12px 14px;">APAAR ID</th>
              <th style="padding: 12px 14px;">Programme</th>
              <th style="padding: 12px 14px;">Validity / Expiry</th>
              <th style="padding: 12px 14px;">Status</th>
              <th style="padding: 12px 14px;">QR Preview</th>
              <th style="padding: 12px 14px; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="credentials-tbody">
            ${store.credentials.map(c => renderCredentialRow(c)).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Issue Modal Container -->
    <div id="issue-modal-container"></div>
    <!-- Certificate Modal Container -->
    <div id="certificate-modal-container"></div>
  `;

  container.innerHTML = html;

  // Wire events
  document.getElementById('btn-open-issue-modal').onclick = () => {
    openIssueCredentialModal();
  };
}

function renderCredentialRow(c) {
  let badgeTone = "success";
  let badgeText = "Active";
  if (c.status === "REVOKED") {
    badgeTone = "danger";
    badgeText = "Revoked";
  } else if (c.status === "EXPIRED") {
    badgeTone = "warning";
    badgeText = "Expired";
  }

  const qrVerificationUrl = `${window.location.origin}/verify?id=${c.id}`;
  const miniQr = renderQrCodeSvg(qrVerificationUrl, 44, c.status === "REVOKED");

  return `
    <tr style="border-bottom: 1px solid var(--line); font-size: 0.9rem;" id="row-${c.id}">
      <td style="padding: 14px;">
        <strong style="color: var(--ink); display: block;">${c.name}</strong>
        <span style="font-size: 0.75rem; color: var(--muted); font-family: 'IBM Plex Mono', monospace;">${c.id} · ${c.studentId}</span>
      </td>
      <td style="padding: 14px;">
        <code style="background: var(--canvas); padding: 3px 8px; border-radius: 4px; font-weight: 600; color: var(--accent);">${c.apaarId}</code>
      </td>
      <td style="padding: 14px;">
        <div>${c.programme}</div>
        <small style="color: var(--muted);">${c.academicYear} · ${c.quota}</small>
      </td>
      <td style="padding: 14px;">
        <div style="font-size: 0.85rem;">Valid until: <strong>${c.expiresAt.split('T')[0]}</strong></div>
        <small style="color: var(--muted-2);">Issued: ${c.issuedAt.split('T')[0]}</small>
      </td>
      <td style="padding: 14px;">
        <span class="status-badge status-badge--${badgeTone}">
          <span class="status-badge__dot"></span>
          ${badgeText}
        </span>
      </td>
      <td style="padding: 14px; text-align: center;">
        <div style="cursor: pointer; display: inline-block;" onclick="openCredentialCertificate('${c.id}')" title="Click to enlarge & verify">
          ${miniQr}
        </div>
      </td>
      <td style="padding: 14px; text-align: right;">
        <div style="display: flex; gap: 6px; justify-content: flex-end;">
          <button class="button button--small button--secondary" onclick="openCredentialCertificate('${c.id}')" title="Certificate / QR print view">
            Certificate
          </button>
          ${c.status === 'ACTIVE' ? `
            <button class="button button--small" style="color: var(--danger); border: 1px solid #fca5a5; background: #fff5f5;" onclick="promptRevoke('${c.id}')">
              Revoke
            </button>
          ` : c.status === 'REVOKED' ? `
            <button class="button button--small" style="color: var(--success); border: 1px solid #86efac; background: #f0fdf4;" onclick="handleReinstate('${c.id}')">
              Reinstate
            </button>
          ` : `
            <button class="button button--small button--secondary" disabled>Expired</button>
          `}
        </div>
      </td>
    </tr>
  `;
}

// Issue Credential Modal
function openIssueCredentialModal() {
  const modalContainer = document.getElementById('issue-modal-container');
  modalContainer.innerHTML = `
    <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div class="panel" style="background: #fff; width: 100%; max-width: 600px; border-radius: 12px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <p class="eyebrow" style="margin: 0 0 4px;">CREDENTIAL GENERATION ENGINE</p>
            <h2 style="margin: 0; font-size: 1.35rem; font-weight: 700;">Issue Verifiable Academic Credential</h2>
          </div>
          <button style="border: none; background: transparent; font-size: 1.5rem; cursor: pointer;" onclick="closeIssueModal()">&times;</button>
        </div>

        <form id="form-issue-credential">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">Student Full Name *</label>
            <input type="text" id="issue-name" required placeholder="e.g. Rohan Mehra" style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 6px;" value="Rohan Mehra">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">APAAR ID (12 Digits) *</label>
              <input type="text" id="issue-apaar" required placeholder="1234-5678-9012" pattern="[0-9\\-]{12,14}" style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 6px; font-family: monospace;" value="8942-1102-7749">
            </div>
            <div>
              <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">Student Roll / ID *</label>
              <input type="text" id="issue-studentid" required placeholder="e.g. IITB-CSE-2024-089" style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 6px;" value="IITB-CSE-2024-089">
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">Academic Programme *</label>
            <input type="text" id="issue-programme" required placeholder="e.g. B.Tech Computer Science & Engineering" style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 6px;" value="B.Tech Computer Science & Engineering">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">Admission Quota</label>
              <select id="issue-quota" style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 6px;">
                <option value="Merit / Regular">Merit / Regular Quota</option>
                <option value="Supernumerary">Supernumerary Seat</option>
                <option value="NRI Quota">NRI Category</option>
                <option value="OCI Category">OCI Status</option>
                <option value="Foreign National">Foreign National (FN)</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">Validity Period</label>
              <select id="issue-validity" style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 6px;">
                <option value="4">4 Years (Standard UG)</option>
                <option value="2">2 Years (Standard PG)</option>
                <option value="1">1 Year (Diploma)</option>
                <option value="custom">Permanent / Degree Awarded</option>
              </select>
            </div>
          </div>

          <div style="background: var(--canvas); border: 1px dashed var(--line-strong); border-radius: 6px; padding: 14px; margin-bottom: 24px; font-size: 0.8rem; color: var(--muted);">
            <strong>Cryptographic Guarantee:</strong> Upon submission, this record is signed with the Institution's Ed25519 key, hashed via SHA-256, and permanently recorded to the AICTE immutable audit trail.
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" class="button button--secondary" onclick="closeIssueModal()">Cancel</button>
            <button type="submit" class="button button--primary">Sign & Issue Credential</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('form-issue-credential').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('issue-name').value;
    const apaarId = document.getElementById('issue-apaar').value;
    const studentId = document.getElementById('issue-studentid').value;
    const programme = document.getElementById('issue-programme').value;
    const quota = document.getElementById('issue-quota').value;
    const validityYears = parseInt(document.getElementById('issue-validity').value) || 4;
    
    const expiresAt = new Date(Date.now() + validityYears * 365 * 24 * 3600 * 1000).toISOString();

    const newCred = window.SudharshanTrustStore.issueCredential({
      name,
      apaarId,
      studentId,
      programme,
      quota,
      expiresAt
    });

    closeIssueModal();
    // Refresh view
    const mainView = document.querySelector('.workspace-main-content');
    if (mainView) renderCollegeCredentialsView(mainView);
    // Open the generated certificate immediately
    openCredentialCertificate(newCred.id);
  };
}

function closeIssueModal() {
  const container = document.getElementById('issue-modal-container');
  if (container) container.innerHTML = '';
}

// Revoke Prompt
function promptRevoke(credId) {
  const reason = prompt("Enter the official reason for revocation (this will be permanently logged to the AICTE audit trail):", "Dual Enrolment Clash detected with overlapping semester dates (Rule R06)");
  if (reason) {
    window.SudharshanTrustStore.revokeCredential(credId, reason, "Institution Authority & AICTE Cell");
    const mainView = document.querySelector('.workspace-main-content');
    if (mainView) renderCollegeCredentialsView(mainView);
    alert(`Credential ${credId} has been revoked. Verifier scans will now display REVOKED.`);
  }
}

function handleReinstate(credId) {
  if (confirm(`Reinstate credential ${credId}? This will restore its ACTIVE verification status.`)) {
    window.SudharshanTrustStore.reinstateCredential(credId);
    const mainView = document.querySelector('.workspace-main-content');
    if (mainView) renderCollegeCredentialsView(mainView);
  }
}

// 2. Certificate & QR Modal (Requirement 10: APAAR ID next to Student ID)
function openCredentialCertificate(credId) {
  const cred = window.SudharshanTrustStore.credentials.find(c => c.id === credId);
  if (!cred) return;

  const modalContainer = document.getElementById('certificate-modal-container') || document.body;
  const qrVerificationUrl = `${window.location.origin}/verify?id=${cred.id}`;
  const qrSvg = renderQrCodeSvg(qrVerificationUrl, 160, cred.status === "REVOKED");

  const modalDiv = document.createElement('div');
  modalDiv.id = "cert-modal-overlay";
  modalDiv.className = "modal-backdrop";
  modalDiv.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;";

  modalDiv.innerHTML = `
    <div style="background: #fff; width: 100%; max-width: 820px; border-radius: 12px; padding: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); max-height: 95vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span class="eyebrow" style="margin: 0;">AICTE COMPLIANT ACADEMIC CERTIFICATE (REQ 10)</span>
        <div style="display: flex; gap: 8px;">
          <button class="button button--small button--secondary" onclick="window.print()">Print Certificate</button>
          <button style="border: none; background: transparent; font-size: 1.5rem; cursor: pointer; padding: 0 8px;" onclick="document.getElementById('cert-modal-overlay').remove()">&times;</button>
        </div>
      </div>

      <!-- Printable Certificate View -->
      <div class="aicte-certificate" id="printable-certificate">
        <div style="text-align: center; border-bottom: 2px solid #155b58; padding-bottom: 20px; margin-bottom: 28px;">
          <div style="display: flex; justify-content: center; align-items: center; gap: 14px; margin-bottom: 8px;">
            <img src="/apaar-mark.svg" alt="APAAR" style="width: 44px; height: 44px;">
            <h1 style="font-size: 1.6rem; margin: 0; color: #155b58; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em;">${cred.institution}</h1>
          </div>
          <p style="margin: 0; font-size: 0.85rem; color: #64748b; font-family: 'IBM Plex Mono', monospace;">Approved by All India Council for Technical Education (AICTE ID: ${cred.institutionAicteId})</p>
        </div>

        <div style="text-align: center; margin-bottom: 28px;">
          <span style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.15em; color: #c9a56a; font-weight: 700;">Statement of Academic Enrolment & Verification</span>
          <h2 style="font-size: 1.9rem; margin: 12px 0 6px; color: #0f172a;">This is to certify that</h2>
          <h3 style="font-size: 2.2rem; margin: 0; color: #155b58; font-family: 'Instrument Serif', Georgia, serif; font-weight: normal;">${cred.name}</h3>
        </div>

        <p style="text-align: center; font-size: 1.05rem; line-height: 1.6; color: #334155; margin-bottom: 28px; max-width: 600px; margin-left: auto; margin-right: auto;">
          is officially registered in the Programme <strong>${cred.programme}</strong> for the academic session <strong>${cred.academicYear}</strong>. The enrolment has been verified against the National APAAR Repository and approved under AICTE regulatory quotas.
        </p>

        <!-- Requirement 10: APAAR ID next to Student ID -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="border-right: 1px solid #e2e8f0; padding-right: 16px;">
            <span style="font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">Institutional Student ID</span>
            <code style="font-size: 1.15rem; font-weight: 700; color: #0f172a;">${cred.studentId}</code>
          </div>
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: #155b58; font-weight: 700; display: block; margin-bottom: 4px;">National APAAR ID (Unique)</span>
            <code style="font-size: 1.15rem; font-weight: 700; color: #155b58; font-family: 'IBM Plex Mono', monospace;">${cred.apaarId}</code>
          </div>
        </div>

        <!-- Footer with QR and Seal -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10px;">
          <div style="text-align: center;">
            <div style="background: #fff; padding: 6px; border: 1px solid #cbd5e1; border-radius: 8px; display: inline-block;">
              ${qrSvg}
            </div>
            <span style="display: block; font-size: 0.7rem; color: #64748b; margin-top: 6px; font-family: 'IBM Plex Mono', monospace;">Scan with any phone to verify</span>
          </div>

          <div style="text-align: right; max-width: 320px;">
            <div style="border-bottom: 1px solid #0f172a; width: 180px; margin-left: auto; margin-bottom: 6px;"></div>
            <strong style="font-size: 0.85rem; display: block;">Registrar & Academic Dean</strong>
            <span style="font-size: 0.75rem; color: #64748b;">Digitally Signed & Validated</span>
            <div style="font-size: 0.7rem; color: #94a3b8; font-family: monospace; margin-top: 4px; word-break: break-all;">
              Hash: ${cred.hash.slice(0, 24)}...
            </div>
          </div>
        </div>

        <div class="certificate-seal">
          <span>AICTE</span>
          <span>VERIFIED</span>
          <span>RECORD</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalDiv);
}

// 3. Student QR View Component (/student/qr)
function renderStudentQrView(container) {
  const store = window.SudharshanTrustStore;
  const currentStudent = store.credentials[0]; // Aarav Sharma by default
  const qrVerificationUrl = `${window.location.origin}/verify?id=${currentStudent.id}`;
  const qrSvg = renderQrCodeSvg(qrVerificationUrl, 220, currentStudent.status === "REVOKED");

  container.innerHTML = `
    <div class="page-header" style="margin-bottom: 24px;">
      <p class="eyebrow">STUDENT PORTAL · TRUST & CREDENTIALS</p>
      <h1 style="font-size: 1.85rem; font-weight: 700; color: var(--ink); margin: 0 0 6px;">My Verifiable Student QR Pass</h1>
      <p style="color: var(--muted); margin: 0;">Present this QR code to employers, regulatory officials, or campus checkpoints for instant zero-trust verification.</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; max-width: 1000px;">
      
      <!-- Left: Dynamic Scannable QR Card -->
      <div class="panel" style="background: #ffffff; border: 1px solid var(--line); border-radius: 16px; padding: 36px; text-align: center; box-shadow: var(--shadow-1);">
        <div style="margin-bottom: 20px;">
          <span class="status-badge status-badge--${currentStudent.status === 'ACTIVE' ? 'success' : 'danger'}" style="margin-bottom: 12px;">
            <span class="status-badge__dot"></span>
            ${currentStudent.status}
          </span>
          <h2 style="font-size: 1.5rem; margin: 0; color: var(--ink);">${currentStudent.name}</h2>
          <p style="color: var(--muted); font-size: 0.9rem; margin: 4px 0 0;">${currentStudent.programme}</p>
        </div>

        <!-- The Scannable QR Code -->
        <div style="background: #ffffff; border: 2px solid ${currentStudent.status === 'REVOKED' ? '#ef4444' : '#10b981'}; border-radius: 16px; padding: 20px; display: inline-block; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
          ${qrSvg}
        </div>

        <div style="margin-bottom: 24px;">
          <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--muted); font-weight: 600; margin-bottom: 4px;">Permanent National Academic ID</div>
          <code style="font-size: 1.25rem; font-weight: 700; color: var(--accent); background: var(--canvas); padding: 4px 12px; border-radius: 6px; letter-spacing: 0.05em;">${currentStudent.apaarId}</code>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button class="button button--secondary button--small" onclick="downloadQrSvg('${currentStudent.apaarId}')">
            Download QR SVG
          </button>
          <button class="button button--primary button--small" onclick="openCredentialCertificate('${currentStudent.id}')">
            View Certificate (Req 10)
          </button>
        </div>
      </div>

      <!-- Right: Security & Consent Details -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="panel" style="background: #ffffff; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
          <h3 style="font-size: 1.1rem; margin: 0 0 14px; font-weight: 600;">Credential Properties</h3>
          
          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
              <span style="color: var(--muted);">Credential ID</span>
              <strong style="font-family: monospace;">${currentStudent.id}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
              <span style="color: var(--muted);">Institution</span>
              <strong>${currentStudent.institution}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
              <span style="color: var(--muted);">Academic Period</span>
              <span>${currentStudent.academicYear}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
              <span style="color: var(--muted);">Valid Until</span>
              <span style="color: var(--success); font-weight: 600;">${currentStudent.expiresAt.split('T')[0]}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
              <span style="color: var(--muted);">Digital Signature</span>
              <span style="font-family: monospace; font-size: 0.75rem; color: var(--accent);">ECDSA-P256-SHA256 (AICTE Key Vault)</span>
            </div>
          </div>
        </div>

        <!-- Privacy & Consent Notice -->
        <div class="panel" style="background: var(--canvas); border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--accent);">Your Privacy is Protected (DPDP Act 2023)</h4>
          </div>
          <p style="font-size: 0.85rem; color: var(--muted); margin: 0 0 16px; line-height: 1.5;">
            When an employer scans your QR, they ONLY see fields you have explicitly consented to share. Non-consented fields (like CGPA, category, and phone) are masked.
          </p>
          <a href="/student/consent" class="button button--secondary button--small" style="display: inline-block;">
            Manage Field-Level Consent →
          </a>
        </div>

        <!-- Quick Demo Verification Trigger -->
        <div class="panel" style="border: 1px dashed var(--accent); background: #f0fdf4; border-radius: 12px; padding: 20px;">
          <h4 style="margin: 0 0 6px; font-size: 0.9rem; color: var(--accent);">Hackathon Demo Testing</h4>
          <p style="font-size: 0.8rem; color: var(--muted); margin: 0 0 12px;">Test how your QR code scans on the employer checkpoint right now.</p>
          <a href="/verify?id=${currentStudent.id}" class="button button--primary button--small" style="display: inline-block;">
            Simulate Verifier Checkpoint Scan →
          </a>
        </div>
      </div>
    </div>
  `;
}

function downloadQrSvg(apaarId) {
  const store = window.SudharshanTrustStore;
  const currentStudent = store.credentials.find(c => c.apaarId === apaarId) || store.credentials[0];
  const url = `${window.location.origin}/verify?id=${currentStudent.id}`;
  const svg = renderQrCodeSvg(url, 400, currentStudent.status === "REVOKED");
  
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `APAAR-${apaarId}-QR.svg`;
  a.click();
}

// 4. Public Verifier & Checkpoint View (/verify and /student/verification and /aicte/verification)
function renderPublicVerifierView(container, initialQuery = "") {
  const store = window.SudharshanTrustStore;
  
  container.innerHTML = `
    <div style="max-width: 920px; margin: 0 auto; padding: 20px 0;">
      
      <!-- Hero Banner Matching Employer Checkpoint Visual -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #e0f2fe; border-radius: 50%; margin-bottom: 16px;">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <h1 style="font-size: 2.3rem; font-weight: 800; color: var(--ink); margin: 0 0 8px; letter-spacing: -0.02em;">Employer & Regulatory Checkpoint</h1>
        <p style="font-size: 1.15rem; color: var(--accent); font-weight: 600; margin: 0 0 10px;">Verify. Validate. Build Trust.</p>
        <p style="color: var(--muted); max-width: 580px; margin: 0 auto; font-size: 0.95rem;">
          Instant cryptographic validation of student enrolment and qualifications linked to AICTE-approved institutions and the National APAAR Registry.
        </p>
      </div>

      <!-- Quick Demo Scenarios (One-Click for SIH Judges!) -->
      <div class="panel" style="background: var(--canvas); border: 1px solid var(--line); border-radius: 12px; padding: 18px 24px; margin-bottom: 32px;">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 12px;">
          Quick Demo Test Scenarios (Click to test verification outcomes):
        </span>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="button button--small" style="background: #10b981; color: #fff; border: none;" onclick="runVerificationTest('CRED-2026-001')">
            ✓ Test Active Student (Aarav Sharma)
          </button>
          <button class="button button--small" style="background: #ef4444; color: #fff; border: none;" onclick="runVerificationTest('CRED-2026-002')">
            ✕ Test Revoked Record (Priya Patel - Duplicate Clash)
          </button>
          <button class="button button--small" style="background: #f59e0b; color: #fff; border: none;" onclick="runVerificationTest('CRED-2026-003')">
            ⏱ Test Expired Credential (Vikram Singh)
          </button>
          <button class="button button--small button--secondary" onclick="runTamperedVerificationTest()">
            ⚠ Test Tampered / Forged Payload
          </button>
        </div>
      </div>

      <!-- Search / Scan Box -->
      <div class="verifier-card" style="margin-bottom: 32px;">
        <div style="display: flex; gap: 12px;">
          <input type="text" id="verifier-query" placeholder="Enter APAAR ID (e.g. 9823-4412-8921) or Credential ID (e.g. CRED-2026-001)" style="flex: 1; padding: 14px 18px; border: 2px solid var(--line); border-radius: 8px; font-size: 1rem; font-family: monospace;" value="${initialQuery || 'CRED-2026-001'}">
          <button id="btn-verify-now" class="button button--primary" style="padding: 14px 28px; font-size: 1rem; font-weight: 600;">
            Verify Credential
          </button>
        </div>
      </div>

      <!-- Verification Output Container -->
      <div id="verification-output"></div>

    </div>
  `;

  document.getElementById('btn-verify-now').onclick = () => {
    const q = document.getElementById('verifier-query').value;
    executeVerification(q);
  };

  // Run initial query if provided
  if (initialQuery || document.getElementById('verifier-query').value) {
    executeVerification(initialQuery || document.getElementById('verifier-query').value);
  }
}

function runVerificationTest(id) {
  const input = document.getElementById('verifier-query');
  if (input) input.value = id;
  executeVerification(id);
}

function runTamperedVerificationTest() {
  const output = document.getElementById('verification-output');
  output.innerHTML = `
    <div class="verifier-card" style="border: 2px solid #ef4444; background: #fff5f5;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="badge-tampered-large">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          TAMPER DETECTED / CRYPTOGRAPHIC SIGNATURE INVALID
        </div>
        <p style="margin-top: 14px; color: #991b1b; font-size: 1.05rem; font-weight: 600;">
          The payload hash does not match the AICTE Ed25519 digital signature! This credential has been modified or forged.
        </p>
      </div>

      <div style="background: #ffffff; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; font-size: 0.85rem; font-family: monospace;">
        <div>Expected Digest: <strong>8f4c91a03e29f8c12b7a43e8d91b6540c7e2b10a...</strong></div>
        <div style="color: #dc2626; margin-top: 6px;">Computed Digest: <strong>e3b0c44298fc1c149afbf4c8996fb92427ae41e4... [MISMATCH]</strong></div>
        <div style="color: #64748b; margin-top: 10px;">Security Action: Access denied. Verification failed event recorded in AICTE security log.</div>
      </div>
    </div>
  `;
}

function executeVerification(query) {
  const output = document.getElementById('verification-output');
  if (!output) return;

  const result = window.SudharshanTrustStore.verifyCredential(query);

  if (!result.found) {
    output.innerHTML = `
      <div class="verifier-card" style="border: 2px solid #fca5a5; background: #fff5f5; text-align: center; padding: 40px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="margin-bottom: 12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2 style="color: #991b1b; margin: 0 0 8px;">No Student Record Found</h2>
        <p style="color: var(--muted); margin: 0;">The identifier "${query}" is not registered in the AICTE Enrolment Database.</p>
      </div>
    `;
    return;
  }

  const c = result.credential;
  const disp = result.authorizedDisplay;
  const isRevoked = result.status === "REVOKED";
  const isExpired = result.status === "EXPIRED";
  const isValid = result.status === "VERIFIED";

  const qrUrl = `${window.location.origin}/verify?id=${c.id}`;
  const qrSvg = renderQrCodeSvg(qrUrl, 160, isRevoked);

  let badgeMarkup = "";
  if (isValid) {
    badgeMarkup = `
      <div class="badge-verified-large">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        Verified
      </div>
    `;
  } else if (isRevoked) {
    badgeMarkup = `
      <div class="badge-revoked-large">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Revoked
      </div>
    `;
  } else {
    badgeMarkup = `
      <div class="badge-expired-large">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Expired
      </div>
    `;
  }

  output.innerHTML = `
    <div class="verifier-card">
      
      <!-- Top Status Banner -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--line); padding-bottom: 24px; margin-bottom: 24px; flex-wrap: wrap; gap: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div class="${isRevoked ? 'qr-box-revoked' : 'qr-box-verified'}">
            ${qrSvg}
          </div>
          <div>
            ${badgeMarkup}
            <div style="margin-top: 10px; font-size: 0.85rem; color: var(--muted); font-family: monospace;">
              Timestamp: ${new Date().toLocaleTimeString()} · AICTE Verified Registry
            </div>
          </div>
        </div>

        <button class="button button--secondary button--small" onclick="openCredentialCertificate('${c.id}')">
          View Official Certificate
        </button>
      </div>

      <!-- Revocation Warning Box if Revoked -->
      ${isRevoked && result.revocationDetails ? `
        <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 10px; color: #991b1b; font-weight: 700; margin-bottom: 6px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            OFFICIAL REVOCATION NOTICE
          </div>
          <p style="margin: 0 0 10px; font-size: 0.95rem; color: #7f1d1d; font-weight: 600;">
            ${result.revocationDetails.reason}
          </p>
          <div style="font-size: 0.8rem; color: #991b1b; font-family: monospace;">
            Revoked by: ${result.revocationDetails.revokedBy} · Timestamp: ${result.revocationDetails.revokedAt}
          </div>
        </div>
      ` : ''}

      <!-- Authorized Information Display (Data Minimisation / Field-Level Consent) -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0; color: var(--ink);">Authorised Student Information</h3>
          <span style="font-size: 0.8rem; color: var(--accent); background: var(--accent-soft); padding: 4px 10px; border-radius: 4px; font-weight: 600;">
            DPDP Act 2023 Consent Applied
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: var(--canvas); padding: 20px; border-radius: 8px;">
          <div>
            <span style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase;">Candidate Full Name</span>
            <strong style="font-size: 1.05rem; color: var(--ink);">${disp.name}</strong>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase;">National APAAR ID</span>
            <code style="font-size: 1.05rem; color: var(--accent); font-weight: 700;">${disp.apaarId}</code>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase;">Approved Institution</span>
            <strong style="color: var(--ink);">${disp.institution}</strong>
            <small style="display: block; color: var(--muted);">${disp.institutionAicteId}</small>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase;">Degree & Programme</span>
            <strong style="color: var(--ink);">${disp.programme}</strong>
            <small style="display: block; color: var(--muted);">${disp.academicYear}</small>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase;">Enrolment Verification</span>
            <span style="color: var(--success); font-weight: 600;">${disp.enrolmentStatus}</span>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase;">Academic Score / CGPA</span>
            <span>${disp.cgpa}</span>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase;">Admission Quota</span>
            <span>${disp.quota}</span>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase;">Date of Birth</span>
            <span>${disp.dob}</span>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase;">Registered Email</span>
            <span>${disp.email}</span>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase;">Registered Mobile</span>
            <span>${disp.mobile}</span>
          </div>
        </div>

        <!-- Cryptographic Proof Footer -->
        <div style="margin-top: 16px; padding: 12px 16px; background: #ffffff; border: 1px solid var(--line); border-radius: 6px; font-size: 0.78rem; color: var(--muted);">
          <div style="display: flex; justify-content: space-between;">
            <span>Digital Signature: <code style="color: var(--accent);">${disp.signature}</code></span>
            <span>Validation: <strong>Valid Root Anchor</strong></span>
          </div>
        </div>

      </div>

    </div>
  `;
}

// 5. Student Consent Manager Component (/student/consent)
function renderStudentConsentView(container) {
  const store = window.SudharshanTrustStore;
  const currentApaar = "9823-4412-8921";
  const consent = store.consentMatrix[currentApaar];

  container.innerHTML = `
    <div class="page-header" style="margin-bottom: 24px;">
      <p class="eyebrow">STUDENT PORTAL · DATA PRIVACY & CONSENT</p>
      <h1 style="font-size: 1.85rem; font-weight: 700; color: var(--ink); margin: 0 0 6px;">Field-Level Privacy & Consent Manager</h1>
      <p style="color: var(--muted); margin: 0;">In accordance with India's Digital Personal Data Protection (DPDP) Act 2023, you have full ownership over which attributes third parties can inspect.</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; max-width: 1050px;">
      
      <!-- Left: Consent Toggles -->
      <div class="panel" style="background: #ffffff; border: 1px solid var(--line); border-radius: 12px; padding: 28px;">
        <h2 style="font-size: 1.2rem; font-weight: 700; margin: 0 0 6px;">Field Sharing Authorizations</h2>
        <p style="font-size: 0.85rem; color: var(--muted); margin: 0 0 20px;">Toggle fields on or off. Changes take effect across verifier QR scans instantly.</p>

        <!-- Toggle Items -->
        <div class="consent-item">
          <div>
            <strong style="display: block; font-size: 0.95rem;">Student Name & APAAR ID</strong>
            <small style="color: var(--muted);">Essential for academic identity</small>
          </div>
          <label class="consent-switch">
            <input type="checkbox" checked disabled>
            <span class="consent-slider"></span>
          </label>
        </div>

        <div class="consent-item">
          <div>
            <strong style="display: block; font-size: 0.95rem;">Institution & Programme Enrolment</strong>
            <small style="color: var(--muted);">Degree title and academic period</small>
          </div>
          <label class="consent-switch">
            <input type="checkbox" checked disabled>
            <span class="consent-slider"></span>
          </label>
        </div>

        <div class="consent-item">
          <div>
            <strong style="display: block; font-size: 0.95rem;">Academic CGPA / Marks</strong>
            <small style="color: var(--muted);">Reveal overall cumulative score</small>
          </div>
          <label class="consent-switch">
            <input type="checkbox" id="toggle-cgpa" ${consent.shareCgpa ? 'checked' : ''} onchange="updateConsentField('shareCgpa', this.checked)">
            <span class="consent-slider"></span>
          </label>
        </div>

        <div class="consent-item">
          <div>
            <strong style="display: block; font-size: 0.95rem;">Admission Quota / Category</strong>
            <small style="color: var(--muted);">Supernumerary, NRI, Merit status</small>
          </div>
          <label class="consent-switch">
            <input type="checkbox" id="toggle-category" ${consent.shareCategory ? 'checked' : ''} onchange="updateConsentField('shareCategory', this.checked)">
            <span class="consent-slider"></span>
          </label>
        </div>

        <div class="consent-item">
          <div>
            <strong style="display: block; font-size: 0.95rem;">Full Date of Birth</strong>
            <small style="color: var(--muted);">When off, only birth year is visible</small>
          </div>
          <label class="consent-switch">
            <input type="checkbox" id="toggle-dob" ${consent.shareDob ? 'checked' : ''} onchange="updateConsentField('shareDob', this.checked)">
            <span class="consent-slider"></span>
          </label>
        </div>

        <div class="consent-item">
          <div>
            <strong style="display: block; font-size: 0.95rem;">Contact Mobile & Email</strong>
            <small style="color: var(--muted);">When off, contact info is masked</small>
          </div>
          <label class="consent-switch">
            <input type="checkbox" id="toggle-contact" ${consent.shareContact ? 'checked' : ''} onchange="updateConsentField('shareContact', this.checked)">
            <span class="consent-slider"></span>
          </label>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.85rem; color: var(--muted);">Consent valid until: <strong>${consent.consentExpiry}</strong></span>
          <button class="button button--secondary button--small" style="color: var(--danger);" onclick="revokeAllConsents()">
            Revoke All Consents
          </button>
        </div>
      </div>

      <!-- Right: Live Verifier Preview -->
      <div class="panel" style="background: var(--canvas); border: 1px solid var(--line); border-radius: 12px; padding: 28px;">
        <span class="eyebrow" style="margin-bottom: 6px;">REAL-TIME TRANSPARENCY</span>
        <h3 style="font-size: 1.15rem; margin: 0 0 14px; font-weight: 700;">What an Employer Sees When Scanning Your QR</h3>
        
        <div style="background: #ffffff; border: 1px solid var(--line); border-radius: 8px; padding: 20px; font-size: 0.85rem;" id="live-consent-preview">
          ${renderConsentLivePreview(consent)}
        </div>

        <div style="margin-top: 20px;">
          <a href="/verify?id=CRED-2026-001" class="button button--primary button--small" style="width: 100%; text-align: center; display: block;">
            Open Verifier Checkpoint in New Tab →
          </a>
        </div>
      </div>

    </div>
  `;
}

function updateConsentField(field, isChecked) {
  const store = window.SudharshanTrustStore;
  const currentApaar = "9823-4412-8921";
  store.consentMatrix[currentApaar][field] = isChecked;
  store.logEvent("Student (Aarav Sharma)", "Student", "CONSENT_UPDATED", `APAAR-${currentApaar}`, `Updated field permission: ${field} = ${isChecked}`);

  // Update preview
  const preview = document.getElementById('live-consent-preview');
  if (preview) {
    preview.innerHTML = renderConsentLivePreview(store.consentMatrix[currentApaar]);
  }
}

function revokeAllConsents() {
  const store = window.SudharshanTrustStore;
  const currentApaar = "9823-4412-8921";
  const c = store.consentMatrix[currentApaar];
  c.shareCgpa = false;
  c.shareCategory = false;
  c.shareDob = false;
  c.shareContact = false;
  store.logEvent("Student (Aarav Sharma)", "Student", "CONSENT_REVOKED_ALL", `APAAR-${currentApaar}`, `Revoked all non-mandatory data sharing authorizations.`);
  
  const main = document.querySelector('.workspace-main-content');
  if (main) renderStudentConsentView(main);
  alert("All optional data sharing has been revoked. Third parties can now only verify your basic enrolment.");
}

function renderConsentLivePreview(c) {
  return `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
        <span style="color: #64748b;">Candidate Name:</span>
        <strong>Aarav Sharma</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
        <span style="color: #64748b;">Enrolment Status:</span>
        <strong style="color: #10b981;">✓ Verified Enrolment</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
        <span style="color: #64748b;">Academic Score (CGPA):</span>
        <span>${c.shareCgpa ? '<strong>9.24 / 10.0</strong>' : '<span style="color: #94a3b8;">🔒 Hidden by Student</span>'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
        <span style="color: #64748b;">Admission Quota:</span>
        <span>${c.shareCategory ? '<strong>Merit / Regular</strong>' : '<span style="color: #94a3b8;">🔒 Hidden by Student</span>'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
        <span style="color: #64748b;">Date of Birth:</span>
        <span>${c.shareDob ? '<strong>2004-05-14</strong>' : '••••-••-2004 (Masked)'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
        <span style="color: #64748b;">Contact Details:</span>
        <span>${c.shareContact ? '<strong>aarav.sharma@iitb.ac.in</strong>' : 'aa••••@iitb.ac.in (Masked)'}</span>
      </div>
    </div>
  `;
}

// 6. Audit Trail & Tamper Detection Component (/aicte/audit and /college/activity)
function renderAuditTrailView(container, role = "aicte") {
  const store = window.SudharshanTrustStore;
  const integrity = store.verifyChainIntegrity();

  container.innerHTML = `
    <div class="page-header" style="margin-bottom: 24px;">
      <p class="eyebrow">${role.toUpperCase()} · IMMUTABLE TRUST LAYER</p>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px;">
        <div>
          <h1 style="font-size: 1.85rem; font-weight: 700; color: var(--ink); margin: 0 0 6px;">Hash-Chained Audit Trail & Tamper Detection</h1>
          <p style="color: var(--muted); margin: 0; max-width: 650px;">
            Every admission, credential issuance, verification scan, and revocation is hashed and chained sequentially using SHA-256. Any database edit breaks the cryptographic chain.
          </p>
        </div>

        <div style="display: flex; gap: 8px;">
          <button id="btn-verify-chain" class="button button--primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Verify Chain Integrity
          </button>
          <button id="btn-simulate-tamper" class="button" style="background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5;">
            Simulate Tamper
          </button>
          <button id="btn-restore-chain" class="button button--secondary">
            Restore Chain
          </button>
        </div>
      </div>
    </div>

    <!-- Integrity Status Banner -->
    <div id="integrity-banner-container" style="margin-bottom: 24px;">
      ${renderIntegrityBanner(integrity)}
    </div>

    <!-- Interactive Hash Chain Blocks -->
    <div class="panel" style="background: #ffffff; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 1.15rem; font-weight: 700; margin: 0;">Audit Log Entries (${store.auditTrail.length} Chained Blocks)</h2>
        <span style="font-size: 0.8rem; color: var(--muted); font-family: monospace;">Genesis Hash: 00000000...0000</span>
      </div>

      <div class="hash-chain-container" id="hash-chain-list">
        ${store.auditTrail.map((b, idx) => renderHashBlock(b, idx, integrity)).join('')}
      </div>
    </div>
  `;

  // Wire buttons
  document.getElementById('btn-verify-chain').onclick = () => {
    const res = store.verifyChainIntegrity();
    document.getElementById('integrity-banner-container').innerHTML = renderIntegrityBanner(res);
    renderChainBlocks(res);
  };

  document.getElementById('btn-simulate-tamper').onclick = () => {
    store.simulateTamper(2); // Tamper with block #2 (Block AUD-003)
    const res = store.verifyChainIntegrity();
    document.getElementById('integrity-banner-container').innerHTML = renderIntegrityBanner(res);
    renderChainBlocks(res);
  };

  document.getElementById('btn-restore-chain').onclick = () => {
    store.restoreChain();
    const res = store.verifyChainIntegrity();
    document.getElementById('integrity-banner-container').innerHTML = renderIntegrityBanner(res);
    renderChainBlocks(res);
  };
}

function renderIntegrityBanner(res) {
  if (res.valid) {
    return `
      <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 18px 24px; display: flex; align-items: center; gap: 16px;">
        <div style="background: #10b981; color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
          ✓
        </div>
        <div>
          <strong style="color: #065f46; font-size: 1.05rem; display: block;">AUDIT CHAIN INTEGRITY: 100% VALID & TAMPER-FREE</strong>
          <span style="color: #047857; font-size: 0.85rem;">All ${res.totalBlocks} sequential cryptographic blocks verified. Mathematical proof guarantees no database rows were altered.</span>
        </div>
      </div>
    `;
  } else {
    return `
      <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 18px 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);">
        <div style="background: #ef4444; color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem;">
          !
        </div>
        <div>
          <strong style="color: #991b1b; font-size: 1.05rem; display: block;">CRITICAL ALERT: UNAUTHORIZED TAMPERING DETECTED!</strong>
          <span style="color: #b91c1c; font-size: 0.85rem;">${res.error}</span>
        </div>
      </div>
    `;
  }
}

function renderChainBlocks(integrity) {
  const container = document.getElementById('hash-chain-list');
  if (container) {
    container.innerHTML = window.SudharshanTrustStore.auditTrail.map((b, idx) => renderHashBlock(b, idx, integrity)).join('');
  }
}

function renderHashBlock(b, idx, integrity) {
  const isTamperedBlock = !integrity.valid && integrity.brokenBlockIndex === idx;

  return `
    <div>
      <div class="hash-block ${isTamperedBlock ? 'hash-block--tampered' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: ${isTamperedBlock ? '#ef4444' : 'var(--accent)'}; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
              Block #${idx + 1}
            </span>
            <strong style="font-size: 0.95rem; color: var(--ink);">${b.action}</strong>
            <span style="font-size: 0.8rem; color: var(--muted);">${b.actor} (${b.actorRole})</span>
          </div>
          <time style="font-size: 0.78rem; color: var(--muted-2); font-family: monospace;">${b.timestamp}</time>
        </div>

        <p style="margin: 0 0 10px; font-size: 0.88rem; color: ${isTamperedBlock ? '#b91c1c' : 'var(--ink)'}; font-weight: ${isTamperedBlock ? '700' : 'normal'};">
          ${b.details}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.75rem; background: var(--canvas); padding: 8px 12px; border-radius: 4px;">
          <div>
            <span style="color: var(--muted); display: block;">Previous Block Hash (prev_hash):</span>
            <span class="hash-mono">${b.prevHash.slice(0, 32)}...</span>
          </div>
          <div>
            <span style="color: var(--muted); display: block;">Current Block Hash:</span>
            <span class="hash-mono" style="color: ${isTamperedBlock ? '#dc2626' : 'var(--accent)'}; font-weight: 700;">
              ${b.hash.slice(0, 32)}...
            </span>
          </div>
        </div>
      </div>

      ${idx < window.SudharshanTrustStore.auditTrail.length - 1 ? `
        <div class="hash-connector">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          <span style="margin-left: 6px;">Cryptographically linked to Block #${idx + 2}</span>
        </div>
      ` : ''}
    </div>
  `;
}

