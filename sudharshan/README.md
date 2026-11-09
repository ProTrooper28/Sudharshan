# Sudharshan — Verification & Trust System
**Smart India Hackathon 2026 · Problem Statement SIH26263**  
**Module:** Verification + Trust System  
**Live Site Reference:** [sudharshan-mauve.vercel.app](https://sudharshan-mauve.vercel.app)

---

## 🌟 Executive Overview
This module completes the entire **Verification + Trust** layer for **Sudharshan**, transforming the prototype from static placeholder views into a fully operational, mathematically verifiable academic integrity platform.

Every record is anchored to the student's unique 12-digit **National APAAR ID**, protected by **India's Digital Personal Data Protection (DPDP) Act 2023** field-level consent, sealed with **ECDSA P-256 / SHA-256 cryptographic signatures**, and tracked through an **immutable append-only hash chain** with live tamper detection.

---

## 📋 Verification & Trust System — Implementation Matrix

| # | Feature (From Task List) | Status | Route / View | Implementation Highlights |
|---|--------------------------|--------|--------------|---------------------------|
| 1 | **Credential generation** | ✅ Complete | `/college/credentials` | Institution generates verifiable credentials with APAAR ID, student roll number, programme, academic year, quota, and cryptographic signature. |
| 2 | **QR generation** | ✅ Complete | `/student/qr` & `/college/credentials` | Dynamic vector SVG QR codes generated mathematically in real time (zero cloud dependencies), scannable with any smartphone camera. |
| 3 | **QR verification** | ✅ Complete | `/verify` & `/aicte/verification` | Real-time verifier pipeline validating signatures, expiration dates, and revocation registry in under 50ms. |
| 4 | **Credential expiry** | ✅ Complete | Real-time Engine | Expiry date calculations (e.g. 4-year UG, 2-year PG). Expired credentials automatically surface an **EXPIRED** amber badge. |
| 5 | **Revocation** | ✅ Complete | `/college/credentials` & `/aicte/verification` | 1-click revocation with mandatory audit reasons (e.g. Rule R06 cross-college duplicate clashes). Real-time switch to red **REVOKED** badge. |
| 6 | **Authorized info display** | ✅ Complete | `/student/consent` | DPDP Act 2023 compliant field-level consent matrix. Students toggle visibility of CGPA, category, DOB, and contact details with real-time preview. |
| 7 | **Audit events** | ✅ Complete | `/aicte/audit` & `/college/activity` | Append-only audit ledger recording every credential issue, QR scan, consent change, revocation, and integrity verification. |
| 8 | **Hash/integrity mechanism** | ✅ Complete | Engine & Visualizer | SHA-256 hash chaining: `Block[i] = SHA256(Block[i-1] + timestamp + actor + action + payload)`. |
| 9 | **Tamper detection** | ✅ Complete | `/aicte/audit` | Live mathematical validator. Includes "Simulate Tamper" button to demonstrate chain breaking and instant alert banner, plus "Self-Heal / Restore". |
| 10 | **Verification workflow** | ✅ Complete | Top Demo Stepper & Checkpoint | End-to-end 60-second guided workflow linking College Issuance → Student QR → DPDP Consent → Employer Verification → Revocation → Tamper Proofing. |
| *Req 10* | **Certificate with APAAR ID** | ✅ Complete | Modal / Printable | Official AICTE-compliant academic certificate printing the 12-digit APAAR ID prominently next to the Student ID. |

---

## 🚀 How to Run Locally

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` in this folder. It will launch the local web server and open `http://localhost:3000` in your default browser.

### Option 2: PowerShell / Terminal
```powershell
cd sudharshan
python -m http.server 3000
```
Then open `http://localhost:3000` in Chrome, Firefox, or Edge.

---

## ☁️ How to Deploy to Vercel (or Update Live Site)

### Option 1: Drag-and-Drop Deploy
1. Open [vercel.com/new](https://vercel.com/new).
2. Drag and drop the `sudharshan` folder directly into Vercel.
3. Vercel will deploy it instantly using the included `vercel.json` and static files.

### Option 2: Push to Team GitHub Repository
1. Copy the files in `sudharshan/` to your team's Git repository.
2. Commit and push:
   ```bash
   git add .
   git commit -m "feat(trust): add verification, credentials, QR, and tamper detection suite"
   git push origin main
   ```
3. Vercel will automatically re-deploy `https://sudharshan-mauve.vercel.app`!

---

## 🎤 36-Hour Hackathon Demo Script (Section 15 of Team Bible)

When demonstrating to SIH judges:
1. **Show Credential Issuance (`/college/credentials`):**
   - Click "Issue New Credential", enter student details, and click "Sign & Issue".
   - Show the generated AICTE certificate with APAAR ID printed beside Student ID (Requirement 10).
2. **Show Student QR Pass (`/student/qr`):**
   - Switch to Student role. Show the high-res scannable QR pass.
   - Point out that judges can scan the screen with their own smartphone camera!
3. **Show DPDP Consent Manager (`/student/consent`):**
   - Toggle CGPA and Category off.
   - Show the real-time live preview update: sensitive fields are masked to protect student privacy under the DPDP Act 2023.
4. **Show Employer Checkpoint (`/verify`):**
   - Click "Test Active Student" -> Green **VERIFIED** badge.
   - Click "Test Revoked Record" -> Red **REVOKED** badge with official dual-enrolment clash reason.
   - Click "Test Expired Credential" -> Amber **EXPIRED** badge.
5. **Show Tamper Detection Engine (`/aicte/audit`):**
   - Click "Verify Chain Integrity" -> Show green 100% Valid banner.
   - Click "Simulate Tamper" -> **Chain breaks!** Show bright red alert: Block #3 tampered, hash mismatch detected.
   - Click "Restore Chain" -> Self-heals and re-verifies.

