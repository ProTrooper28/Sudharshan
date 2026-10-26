'use client';

import React, { useState } from 'react';
import { IssueSeverityBadge } from '@/components/validation/IssueSeverityBadge';
import { BatchValidationReport, IssueSeverity } from '@/types/validation';

export default function ValidationReportPage() {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Demo state matching planted demo batch
  const report: BatchValidationReport = {
    batch_id: 'BATCH-2026-ENG-0881',
    inst_id: 'INST-AICTE-PUNE-41',
    summary: {
      total_rows: 8,
      valid_rows: 3,
      failed_rows: 5,
      block_count: 3,
      critical_count: 2,
      error_count: 2,
      warn_count: 2,
      flag_count: 0,
      can_proceed: false
    },
    issues: [
      {
        batch_id: 'BATCH-2026-ENG-0881',
        enrolment_id: 'row-2',
        rule_id: 'R01',
        severity: 'BLOCK',
        message: 'Row 2: APAAR ID is missing or empty. Mandatory for student registration.',
        field_name: 'apaar_id',
        state: 'open'
      },
      {
        batch_id: 'BATCH-2026-ENG-0881',
        enrolment_id: 'row-3',
        rule_id: 'R02',
        severity: 'BLOCK',
        message: "Row 3: APAAR ID '987654321' must be exactly 12 numeric digits.",
        field_name: 'apaar_id',
        raw_value: '987654321',
        state: 'open'
      },
      {
        batch_id: 'BATCH-2026-ENG-0881',
        enrolment_id: 'row-4',
        rule_id: 'R04',
        severity: 'BLOCK',
        message: "Row 4: Duplicate record in file. APAAR '123456789012' appears 2 times for B.Tech Computer Science.",
        field_name: 'apaar_id',
        raw_value: '123456789012',
        state: 'open'
      },
      {
        batch_id: 'BATCH-2026-ENG-0881',
        enrolment_id: 'row-6',
        rule_id: 'R09',
        severity: 'ERROR',
        message: 'Row 6: Foreign National (FN) applicant cannot have domestic reservation category.',
        field_name: 'nationality',
        raw_value: 'Foreign National',
        state: 'open'
      },
      {
        batch_id: 'BATCH-2026-ENG-0881',
        enrolment_id: 'row-7',
        rule_id: 'R10',
        severity: 'WARN',
        message: "Row 7: Suspected duplicate identity (similarity: 91.5%). Matches existing student 'Aarav Sharma'. Routed to Review Queue.",
        field_name: 'name',
        raw_value: 'Rahul K Sharma',
        state: 'open'
      }
    ]
  };

  const filteredIssues = filterSeverity === 'ALL'
    ? report.issues
    : report.issues.filter(i => i.severity === filterSeverity);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Batch Validation Report</h1>
          <p className="text-sm text-slate-400 mt-1">Batch ID: <span className="font-mono text-cyan-400">{report.batch_id}</span> • Institution: <span className="font-mono">{report.inst_id}</span></p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/api/v1/batches/${report.batch_id}/export-failed`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            📥 Export Failed Rows (CSV)
          </a>
          <button
            disabled={!report.summary.can_proceed}
            className={`px-5 py-2 text-sm font-semibold rounded-lg shadow ${
              report.summary.can_proceed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            Proceed to Final Submission
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Total Rows</p>
          <p className="text-2xl font-bold mt-1 text-white">{report.summary.total_rows}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-emerald-400 font-medium">Valid Rows</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">{report.summary.valid_rows}</p>
        </div>
        <div className="bg-slate-900 border border-red-900/60 p-4 rounded-xl">
          <p className="text-xs text-red-400 font-medium">Blockers</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{report.summary.block_count}</p>
        </div>
        <div className="bg-slate-900 border border-rose-900/60 p-4 rounded-xl">
          <p className="text-xs text-rose-400 font-medium">Critical</p>
          <p className="text-2xl font-bold mt-1 text-rose-400">{report.summary.critical_count}</p>
        </div>
        <div className="bg-slate-900 border border-amber-900/60 p-4 rounded-xl">
          <p className="text-xs text-amber-400 font-medium">Errors</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">{report.summary.error_count}</p>
        </div>
        <div className="bg-slate-900 border border-yellow-900/60 p-4 rounded-xl">
          <p className="text-xs text-yellow-400 font-medium">Warnings</p>
          <p className="text-2xl font-bold mt-1 text-yellow-400">{report.summary.warn_count}</p>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Validation Issues ({filteredIssues.length})</h2>
          <div className="flex gap-2 text-xs">
            {['ALL', 'BLOCK', 'CRITICAL', 'ERROR', 'WARN'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  filterSeverity === sev
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/70 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Rule</th>
              <th className="py-3 px-4">Target Row / ID</th>
              <th className="py-3 px-4">Field</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredIssues.map((issue, idx) => (
              <tr key={idx} className="hover:bg-slate-800/50 transition">
                <td className="py-3 px-4">
                  <IssueSeverityBadge severity={issue.severity} />
                </td>
                <td className="py-3 px-4 font-mono font-bold text-cyan-400">{issue.rule_id}</td>
                <td className="py-3 px-4 font-mono text-xs text-slate-400">{issue.enrolment_id || '-'}</td>
                <td className="py-3 px-4 font-mono text-xs text-slate-300">{issue.field_name || '-'}</td>
                <td className="py-3 px-4 text-slate-200">{issue.message}</td>
                <td className="py-3 px-4">
                  <span className="text-xs uppercase font-medium text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {issue.state}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
