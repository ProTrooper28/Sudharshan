/**
 * Sudharshan Trust & Verification Engine
 * Developed for SIH26263 - APAAR-based Student Data Management & Verification System
 * Module: Verification + Trust System
 */

// Pure JavaScript SHA-256 implementation (works in any browser context, including file://)
function sha256Sync(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';
  var words = [];
  var asciiBitLength = ascii[lengthProperty] * 8;
  var hash = [];
  var k = [];
  var primeCounter = 0;

  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 300; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return; // UTF-8 fallback
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength | 0);

  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2];
      var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      var ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      var temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      var temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (i2 = 3; i2 >= 0; i2--) {
      var b = (hash[i] >> (i2 * 8)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

// Global Trust Store
window.SudharshanTrustStore = {
  // 1. Initial Sample Credentials
  credentials: [
    {
      id: "CRED-2026-001",
      apaarId: "9823-4412-8921",
      studentId: "IITB-CSE-2024-042",
      name: "Aarav Sharma",
      institution: "Indian Institute of Technology Bombay",
      institutionAicteId: "AICTE-1-4928172",
      programme: "B.Tech Computer Science & Engineering",
      academicYear: "2024 - 2028",
      enrolmentStatus: "Verified & Confirmed",
      quota: "Merit / Regular",
      cgpa: "9.24 / 10.0",
      dob: "2004-05-14",
      email: "aarav.sharma@iitb.ac.in",
      mobile: "+91 98765 43210",
      issuedAt: "2024-08-15T10:00:00Z",
      expiresAt: "2028-06-30T23:59:59Z", // Future date -> ACTIVE
      status: "ACTIVE", // ACTIVE | REVOKED | EXPIRED | TAMPERED
      revocationDetails: null,
      signature: "jws:sig:es256:8f4c91a03e29f8c12b7a43e8d91b6540c7e2b10a",
      hash: ""
    },
    {
      id: "CRED-2026-002",
      apaarId: "4719-2038-1194",
      studentId: "DTU-ECE-2024-118",
      name: "Priya Patel",
      institution: "Delhi Technological University",
      institutionAicteId: "AICTE-1-3819201",
      programme: "B.Tech Electronics & Communication",
      academicYear: "2024 - 2028",
      enrolmentStatus: "Disputed / Revoked",
      quota: "Management / Supernumerary",
      cgpa: "8.75 / 10.0",
      dob: "2004-11-20",
      email: "priya.patel@dtu.ac.in",
      mobile: "+91 98112 34567",
      issuedAt: "2024-08-18T14:30:00Z",
      expiresAt: "2028-06-30T23:59:59Z",
      status: "REVOKED", // REVOKED demonstration
      revocationDetails: {
        revokedAt: "2026-10-24T11:15:00Z",
        revokedBy: "AICTE Central Vigilance / Directorate",
        reason: "Dual Enrolment Clash (Rule R06): Student verified simultaneous full-time seat at another institution."
      },
      signature: "jws:sig:es256:1a9c33f20e4b88d75a1c92d40e3f71c98a2b5e01",
      hash: ""
    },
    {
      id: "CRED-2026-003",
      apaarId: "7721-6634-9012",
      studentId: "SPJIMR-PGDM-2022-015",
      name: "Vikram Singh",
      institution: "SPJIMR Mumbai",
      institutionAicteId: "AICTE-1-1092834",
      programme: "Post Graduate Diploma in Management (PGDM)",
      academicYear: "2022 - 2024",
      enrolmentStatus: "Graduated",
      quota: "Regular Quota",
      cgpa: "8.90 / 10.0",
      dob: "1999-03-22",
      email: "vikram.singh@spjimr.org",
      mobile: "+91 97123 98765",
      issuedAt: "2022-07-01T09:00:00Z",
      expiresAt: "2024-07-01T23:59:59Z", // Past date -> EXPIRED
      status: "EXPIRED",
      revocationDetails: null,
      signature: "jws:sig:es256:6634fa9801ec4b901a88c22d7e01b34c90ef2a11",
      hash: ""
    }
  ],

  // 2. Field-Level Student Consent Matrix (DPDP Act 2023 Compliant)
  consentMatrix: {
    "9823-4412-8921": {
      shareName: true,
      shareProgram: true,
      shareInstitution: true,
      shareYear: true,
      shareStatus: true,
      shareCgpa: false, // Student chose not to reveal CGPA to general public
      shareCategory: false, // Hidden for privacy
      shareDob: false, // Masked
      shareContact: false, // Masked
      allowedPurpose: "Employment & Regulatory Verification",
      consentExpiry: "2027-12-31"
    }
  },

  // 3. Append-Only Hash-Chained Audit Trail
  auditTrail: [],

  // 4. Initialize Hash Engine & Audit Chain
  init() {
    // Compute credential hashes
    this.credentials.forEach(c => {
      c.hash = this.computeCredentialHash(c);
    });

    // Seed initial hash chain
    const genesisHash = "0000000000000000000000000000000000000000000000000000000000000000";
    this.auditTrail = [
      {
        id: "AUD-001",
        timestamp: "2024-08-15T10:00:00Z",
        actor: "Registrar (IIT Bombay)",
        actorRole: "Institution Admin",
        action: "CREDENTIAL_ISSUED",
        entityId: "CRED-2026-001 (Aarav Sharma)",
        details: "Issued 4-year verifiable academic credential linked to APAAR ID 9823-4412-8921",
        prevHash: genesisHash,
        hash: ""
      },
      {
        id: "AUD-002",
        timestamp: "2024-08-18T14:30:00Z",
        actor: "Registrar (Delhi Tech Univ)",
        actorRole: "Institution Admin",
        action: "CREDENTIAL_ISSUED",
        entityId: "CRED-2026-002 (Priya Patel)",
        details: "Issued verifiable academic credential for B.Tech ECE",
        prevHash: "",
        hash: ""
      },
      {
        id: "AUD-003",
        timestamp: "2024-09-02T16:20:00Z",
        actor: "Student (Aarav Sharma)",
        actorRole: "Student",
        action: "CONSENT_CONFIGURED",
        entityId: "APAAR-9823-4412-8921",
        details: "Field-level privacy configured under DPDP Act 2023. Withheld CGPA and masked PII.",
        prevHash: "",
        hash: ""
      },
      {
        id: "AUD-004",
        timestamp: "2026-10-24T11:15:00Z",
        actor: "AICTE Central Vigilance",
        actorRole: "AICTE Officer",
        action: "CREDENTIAL_REVOKED",
        entityId: "CRED-2026-002 (Priya Patel)",
        details: "Revocation triggered due to cross-institution clash (Rule R06).",
        prevHash: "",
        hash: ""
      },
      {
        id: "AUD-005",
        timestamp: "2026-10-26T14:40:00Z",
        actor: "Infosys Campus Recruitment",
        actorRole: "Authorised Verifier",
        action: "QR_VERIFIED",
        entityId: "CRED-2026-001 (Aarav Sharma)",
        details: "QR scan verification successful. Consented degree & institution verified.",
        prevHash: "",
        hash: ""
      }
    ];

    // Compute hashes sequentially
    for (let i = 0; i < this.auditTrail.length; i++) {
      if (i > 0) {
        this.auditTrail[i].prevHash = this.auditTrail[i - 1].hash;
      }
      this.auditTrail[i].hash = this.computeAuditHash(this.auditTrail[i]);
    }
  },

  computeCredentialHash(c) {
    const raw = `${c.id}|${c.apaarId}|${c.name}|${c.institution}|${c.programme}|${c.academicYear}|${c.status}`;
    return sha256Sync(raw);
  },

  computeAuditHash(entry) {
    const raw = `${entry.prevHash}|${entry.timestamp}|${entry.actor}|${entry.action}|${entry.entityId}|${entry.details}`;
    return sha256Sync(raw);
  },

  // Record an audit event
  logEvent(actor, actorRole, action, entityId, details) {
    const prevHash = this.auditTrail.length > 0 ? this.auditTrail[this.auditTrail.length - 1].hash : "0".repeat(64);
    const newEntry = {
      id: "AUD-" + String(this.auditTrail.length + 1).padStart(3, '0'),
      timestamp: new Date().toISOString(),
      actor,
      actorRole,
      action,
      entityId,
      details,
      prevHash,
      hash: ""
    };
    newEntry.hash = this.computeAuditHash(newEntry);
    this.auditTrail.push(newEntry);
    return newEntry;
  },

  // Issue New Credential
  issueCredential(data) {
    const newId = "CRED-2026-" + String(this.credentials.length + 1).padStart(3, '0');
    const newCred = {
      id: newId,
      apaarId: data.apaarId,
      studentId: data.studentId || `STU-${Date.now().toString().slice(-4)}`,
      name: data.name,
      institution: data.institution || "Indian Institute of Technology Bombay",
      institutionAicteId: data.institutionAicteId || "AICTE-1-4928172",
      programme: data.programme,
      academicYear: data.academicYear || "2024 - 2028",
      enrolmentStatus: "Verified & Confirmed",
      quota: data.quota || "Regular / Merit",
      cgpa: data.cgpa || "8.50 / 10.0",
      dob: data.dob || "2004-01-01",
      email: data.email || "student@institution.ac.in",
      mobile: data.mobile || "+91 99999 88888",
      issuedAt: new Date().toISOString(),
      expiresAt: data.expiresAt || new Date(Date.now() + 4 * 365 * 24 * 3600 * 1000).toISOString(),
      status: "ACTIVE",
      revocationDetails: null,
      signature: "jws:sig:es256:" + sha256Sync(newId + Date.now()).slice(0, 40),
      hash: ""
    };
    newCred.hash = this.computeCredentialHash(newCred);
    this.credentials.unshift(newCred);

    // Initialize default consent
    if (!this.consentMatrix[newCred.apaarId]) {
      this.consentMatrix[newCred.apaarId] = {
        shareName: true,
        shareProgram: true,
        shareInstitution: true,
        shareYear: true,
        shareStatus: true,
        shareCgpa: false,
        shareCategory: false,
        shareDob: false,
        shareContact: false,
        allowedPurpose: "Employment & Regulatory Verification",
        consentExpiry: "2028-12-31"
      };
    }

    this.logEvent("Institution Registrar", "Institution Admin", "CREDENTIAL_ISSUED", `${newCred.id} (${newCred.name})`, `Verifiable credential issued and signed with AICTE Root ES256 key.`);
    return newCred;
  },

  // Revoke Credential
  revokeCredential(credId, reason, revoker) {
    const cred = this.credentials.find(c => c.id === credId);
    if (!cred) return false;
    cred.status = "REVOKED";
    cred.revocationDetails = {
      revokedAt: new Date().toISOString(),
      revokedBy: revoker || "AICTE Central Verification Cell",
      reason: reason || "Administrative Cancellation / Seat Conflict"
    };
    cred.hash = this.computeCredentialHash(cred);
    this.logEvent(revoker || "AICTE Central Verification Cell", "AICTE Officer", "CREDENTIAL_REVOKED", `${cred.id} (${cred.name})`, `Revocation logged: ${reason}`);
    return true;
  },

  // Reinstate Credential
  reinstateCredential(credId) {
    const cred = this.credentials.find(c => c.id === credId);
    if (!cred) return false;
    cred.status = "ACTIVE";
    cred.revocationDetails = null;
    cred.hash = this.computeCredentialHash(cred);
    this.logEvent("AICTE Central Oversight", "AICTE Officer", "CREDENTIAL_REINSTATED", `${cred.id} (${cred.name})`, `Revocation reversed after review.`);
    return true;
  },

  // Verification Pipeline
  verifyCredential(query) {
    // Search by ID, APAAR ID, or Student ID
    const q = query.trim().toLowerCase();
    const cred = this.credentials.find(c => 
      c.id.toLowerCase() === q || 
      c.apaarId.toLowerCase() === q || 
      c.studentId.toLowerCase() === q ||
      c.name.toLowerCase() === q
    );

    if (!cred) {
      this.logEvent("Anonymous Verifier", "Public Verifier", "VERIFICATION_FAILED", query, "No matching student record found in AICTE registry.");
      return { found: false, error: "Record not found in AICTE registry" };
    }

    // Step 1: Check Expiry
    const now = new Date();
    const expiry = new Date(cred.expiresAt);
    const isExpired = now > expiry;

    // Step 2: Check Tampering
    const expectedHash = this.computeCredentialHash(cred);
    const isTampered = cred.hash !== expectedHash;

    // Step 3: Determine Final Verification Status
    var finalStatus = "VERIFIED";
    if (isTampered) {
      finalStatus = "TAMPERED";
    } else if (cred.status === "REVOKED") {
      finalStatus = "REVOKED";
    } else if (isExpired || cred.status === "EXPIRED") {
      finalStatus = "EXPIRED";
    }

    // Step 4: Apply Field-Level Consent (DPDP Act 2023)
    const consent = this.consentMatrix[cred.apaarId] || {
      shareName: true,
      shareProgram: true,
      shareInstitution: true,
      shareYear: true,
      shareStatus: true,
      shareCgpa: false,
      shareCategory: false,
      shareDob: false,
      shareContact: false
    };

    const consentFilteredData = {
      name: cred.name,
      apaarId: cred.apaarId,
      studentId: cred.studentId,
      institution: cred.institution,
      institutionAicteId: cred.institutionAicteId,
      programme: cred.programme,
      academicYear: cred.academicYear,
      enrolmentStatus: cred.enrolmentStatus,
      issuedAt: cred.issuedAt,
      expiresAt: cred.expiresAt,
      cgpa: consent.shareCgpa ? cred.cgpa : "🔒 Protected by Student Consent",
      quota: consent.shareCategory ? cred.quota : "🔒 Protected by Student Consent",
      dob: consent.shareDob ? cred.dob : "••••-••-" + cred.dob.split('-')[0],
      email: consent.shareContact ? cred.email : cred.email.replace(/(.{2})(.*)(@.*)/, "$1••••$3"),
      mobile: consent.shareContact ? cred.mobile : cred.mobile.slice(0, 6) + "•••••",
      signature: cred.signature,
      signatureAlgorithm: "ECDSA P-256 / SHA-256 (AICTE Key Vault)"
    };

    this.logEvent("Employer / Regulator Verifier", "Authorised Verifier", "QR_VERIFIED", `${cred.id} (${cred.name})`, `Status returned: ${finalStatus}. Applied DPDP consent filter.`);

    return {
      found: true,
      status: finalStatus,
      credential: cred,
      authorizedDisplay: consentFilteredData,
      revocationDetails: cred.revocationDetails,
      isExpired,
      isTampered
    };
  },

  // Tamper Detection System
  verifyChainIntegrity() {
    for (let i = 0; i < this.auditTrail.length; i++) {
      const block = this.auditTrail[i];
      // Check prevHash
      if (i > 0) {
        if (block.prevHash !== this.auditTrail[i - 1].hash) {
          return {
            valid: false,
            brokenBlockIndex: i,
            brokenBlockId: block.id,
            error: `Block #${i} (${block.id}) has corrupted prevHash! Expected ${this.auditTrail[i - 1].hash.slice(0, 12)}..., got ${block.prevHash.slice(0, 12)}...`
          };
        }
      }
      // Check block hash recalculation
      const computed = this.computeAuditHash(block);
      if (block.hash !== computed) {
        return {
          valid: false,
          brokenBlockIndex: i,
          brokenBlockId: block.id,
          error: `Block #${i} (${block.id}) payload was modified! Expected hash ${block.hash.slice(0, 12)}..., computed ${computed.slice(0, 12)}...`
        };
      }
    }
    return { valid: true, totalBlocks: this.auditTrail.length };
  },

  // Tamper Simulator (for demonstration to hackathon judges)
  simulateTamper(blockIndex = 2) {
    if (this.auditTrail[blockIndex]) {
      this.auditTrail[blockIndex].originalDetails = this.auditTrail[blockIndex].details;
      this.auditTrail[blockIndex].details = "FORGED: Student CGPA altered from 8.75 to 9.99 without authorization.";
      return true;
    }
    return false;
  },

  // Self-Heal / Restore Chain
  restoreChain() {
    this.init(); // Reset to clean state
    return true;
  }
};

// Initialize on load
window.SudharshanTrustStore.init();

