'use client';

import React, { useState } from 'react';
import { ReviewCase } from '@/types/validation';

export default function ReviewQueuePage() {
  const [selectedCase, setSelectedCase] = useState<number | null>(1);
  const [note, setNote] = useState('');

  const cases: ReviewCase[] = [
    {
      id: 1,
      case_type: 'clash',
      inst_id: 'INST-AICTE-101',
      academic_year: '2026',
      enrolment_ids: ['ENR-2026-0091', 'ENR-2026-4412'],
      details: {
        apaar_id: '123456789012',
        student_name: 'Aarav Sharma',
        college_a: { name: 'College of Engineering Pune (COEP)', programme: 'B.Tech CSE', date: '2026-07-15' },
        college_b: { name: 'Veermata Jijabai Technological Institute (VJTI)', programme: 'B.Tech IT', date: '2026-07-18' }
      },
      decision: 'pending',
      created_at: '2026-10-26T10:15:00Z'
    },
    {
      id: 2,
      case_type: 'duplicate',
      inst_id: 'INST-AICTE-101',
      academic_year: '2026',
      enrolment_ids: ['ENR-2026-0105'],
      details: {
        similarity: 92.5,
        candidate_1: { name: 'Rahul K. Sharma', dob: '2004-05-12', parent: 'Ramesh Sharma', apaar: '111122223333' },
        candidate_2: { name: 'Rahul Kumar Sharma', dob: '2004-05-12', parent: 'Rameshwar Sharma', apaar: '123456789012' }
      },
      decision: 'pending',
      created_at: '2026-10-26T11:20:00Z'
    }
  ];

  const activeCase = cases.find(c => c.id === selectedCase);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">AICTE Review & Dispute Resolution Queue</h1>
        <p className="text-sm text-slate-400 mt-1">Human-in-the-loop review for dual enrolments, identity clashes, and fuzzy duplicates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Case List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Pending Review Cases ({cases.length})</h2>
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c.id)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedCase === c.id
                  ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  c.case_type === 'clash' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {c.case_type}
                </span>
                <span className="text-xs text-slate-400 font-mono">Case #{c.id}</span>
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-2">
                {c.case_type === 'clash' ? 'Dual Institution Clash' : 'Fuzzy Duplicate Match'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Session: {c.academic_year} • Inst: {c.inst_id}</p>
            </div>
          ))}
        </div>

        {/* Right: Side-by-Side Comparison & Action Pane */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          {activeCase && (
            <>
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeCase.case_type === 'clash' ? 'Dual Enrolment Conflict Investigation' : 'Identity Deduplication Investigation'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">Case ID: #{activeCase.id} • Created: {activeCase.created_at}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                  {activeCase.decision.toUpperCase()}
                </span>
              </div>

              {/* Side-by-Side Comparison Card */}
              {activeCase.case_type === 'clash' ? (
                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="border-r border-slate-800 pr-4 space-y-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Institution A (First Claim)</span>
                    <p className="text-sm font-bold text-white">{activeCase.details?.college_a.name}</p>
                    <p className="text-xs text-slate-300">Programme: <span className="font-medium text-slate-100">{activeCase.details?.college_a.programme}</span></p>
                    <p className="text-xs text-slate-300">Admission Date: {activeCase.details?.college_a.date}</p>
                  </div>
                  <div className="pl-2 space-y-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Institution B (Conflicting Claim)</span>
                    <p className="text-sm font-bold text-white">{activeCase.details?.college_b.name}</p>
                    <p className="text-xs text-slate-300">Programme: <span className="font-medium text-slate-100">{activeCase.details?.college_b.programme}</span></p>
                    <p className="text-xs text-slate-300">Admission Date: {activeCase.details?.college_b.date}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="border-r border-slate-800 pr-4 space-y-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Submitted Record</span>
                    <p className="text-sm font-bold text-white">{activeCase.details?.candidate_1.name}</p>
                    <p className="text-xs text-slate-300">DOB: {activeCase.details?.candidate_1.dob}</p>
                    <p className="text-xs text-slate-300">Parent: {activeCase.details?.candidate_1.parent}</p>
                    <p className="text-xs font-mono text-cyan-400">APAAR: {activeCase.details?.candidate_1.apaar}</p>
                  </div>
                  <div className="pl-2 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Existing Matched Record ({activeCase.details?.similarity}%)</span>
                    <p className="text-sm font-bold text-white">{activeCase.details?.candidate_2.name}</p>
                    <p className="text-xs text-slate-300">DOB: {activeCase.details?.candidate_2.dob}</p>
                    <p className="text-xs text-slate-300">Parent: {activeCase.details?.candidate_2.parent}</p>
                    <p className="text-xs font-mono text-amber-400">APAAR: {activeCase.details?.candidate_2.apaar}</p>
                  </div>
                </div>
              )}

              {/* Action Note & Decision Buttons */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-300">Officer Decision Rationale / Notes</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record formal justification for audit trail (e.g., student verified student-confirmed seat with COEP; VJTI admission revoked)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => alert(`Case #${activeCase.id} rejected and logged in hash-chain audit.`)}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition"
                >
                  Reject & Flag Conflicting Record
                </button>
                <button
                  onClick={() => alert(`Case #${activeCase.id} approved and resolved.`)}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
                >
                  Approve Valid Enrolment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
