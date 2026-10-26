'use client';

import React from 'react';
import { RiskScoreResponse } from '@/types/validation';

export default function RiskScorePage() {
  const riskData: RiskScoreResponse = {
    inst_id: 'INST-AICTE-101',
    academic_year: '2026',
    score: 68.5,
    risk_level: 'HIGH',
    factors: [
      {
        name: 'Rule Violation Rate',
        weight: 0.35,
        raw_value: 0.28,
        contribution: 9.8,
        rationale: 'High validation failure rate (28.0% of rows triggered errors or blocks).'
      },
      {
        name: 'Statistical Anomaly (Isolation Forest)',
        weight: 0.25,
        raw_value: 0.65,
        contribution: 16.25,
        rationale: 'Noticeable variance in admissions patterns compared to historical baseline.'
      },
      {
        name: 'Student Unconfirmed Enrolment Rate',
        weight: 0.20,
        raw_value: 0.35,
        contribution: 7.0,
        rationale: '35.0% of students have not confirmed their enrolment via OTP.'
      },
      {
        name: 'Intake Capacity Pressure',
        weight: 0.10,
        raw_value: 0.98,
        contribution: 9.8,
        rationale: 'Intake capacity hugging alert (admissions at 98.0% of approved seats).'
      },
      {
        name: 'Post-Submission Batch Modifications',
        weight: 0.10,
        raw_value: 0.12,
        contribution: 1.2,
        rationale: 'Post-submission modifications detected on 12.0% of records.'
      }
    ],
    top_three_reasons: [
      'Statistical Anomaly (Isolation Forest): Noticeable variance in admissions patterns compared to historical baseline.',
      'Rule Violation Rate: High validation failure rate (28.0% of rows triggered errors or blocks).',
      'Intake Capacity Pressure: Intake capacity hugging alert (admissions at 98.0% of approved seats).'
    ],
    computed_at: '2026-10-26T12:00:00Z'
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">AICTE Institution Risk Profiler</h1>
        <p className="text-sm text-slate-400 mt-1">Explainable composite risk model for targeted inspections & compliance tracking</p>
      </div>

      {/* Main Score Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Evaluated Institution</span>
          <h2 className="text-xl font-bold text-white mt-1">{riskData.inst_id} (Maharashtra)</h2>
          <p className="text-xs text-slate-400 mt-1">Academic Session: {riskData.academic_year} • Evaluated: {riskData.computed_at}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs font-semibold uppercase text-slate-400">Risk Assessment</span>
            <div className="text-3xl font-black text-rose-400">{riskData.score} <span className="text-base font-normal text-slate-400">/ 100</span></div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 font-bold text-sm tracking-wider uppercase">
            {riskData.risk_level} RISK
          </div>
        </div>
      </div>

      {/* Top 3 Explainable Reasons */}
      <div className="bg-slate-900 border border-amber-900/50 p-6 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <span>⚠️</span> Top 3 Contributing Risk Drivers (Explainability)
        </h3>
        <ul className="space-y-2">
          {riskData.top_three_reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-200 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <span className="font-mono text-cyan-400 font-bold">#{i + 1}</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weighted Factor Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Full Factor Weighting & Contributions</h3>
        <div className="space-y-4">
          {riskData.factors.map((f, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">{f.name} <span className="text-slate-400">({f.weight * 100}% weight)</span></span>
                <span className="font-mono text-cyan-400 font-bold">+{f.contribution} pts</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{ width: `${(f.contribution / (f.weight * 100)) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{f.rationale}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
