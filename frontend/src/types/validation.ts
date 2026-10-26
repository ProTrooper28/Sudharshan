export type IssueSeverity = 'BLOCK' | 'CRITICAL' | 'ERROR' | 'WARN' | 'FLAG';

export interface ValidationIssue {
  id?: number;
  batch_id: string;
  enrolment_id?: string;
  rule_id: string;
  severity: IssueSeverity;
  message: string;
  field_name?: string;
  raw_value?: string;
  state: 'open' | 'fixed' | 'waived';
}

export interface ValidationSummary {
  total_rows: number;
  valid_rows: number;
  failed_rows: number;
  block_count: number;
  critical_count: number;
  error_count: number;
  warn_count: number;
  flag_count: number;
  can_proceed: boolean;
}

export interface BatchValidationReport {
  batch_id: string;
  inst_id: string;
  summary: ValidationSummary;
  issues: ValidationIssue[];
}

export interface ReviewCase {
  id: number;
  case_type: 'duplicate' | 'clash' | 'anomaly' | 'disputed';
  inst_id: string;
  academic_year: string;
  enrolment_ids: string[];
  details?: Record<string, any>;
  decision: 'pending' | 'approved' | 'rejected' | 'escalated';
  decided_by?: string;
  decided_at?: string;
  note?: string;
  created_at: string;
}

export interface RiskFactor {
  name: string;
  weight: number;
  raw_value: number;
  contribution: number;
  rationale: string;
}

export interface RiskScoreResponse {
  inst_id: string;
  academic_year: string;
  score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  top_three_reasons: string[];
  computed_at: string;
}
