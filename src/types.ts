import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type Role = 'aicte' | 'college' | 'student';

export type RouteInfo = {
  title: string;
  description: string;
  role?: Role;
};

export type NavigationItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

export type DemoRecord = {
  reference: string;
  programme: string;
  workflow: string;
  status: 'Awaiting confirmation' | 'Validation review' | 'Ready for review';
  updated: string;
};

export type ActivityItem = {
  title: string;
  detail: string;
  time: string;
  icon?: LucideIcon;
};

export type DataTableColumn = {
  key: string;
  label: string;
  render?: (row: Record<string, ReactNode>) => ReactNode;
};

export type StudentValidationStatus = 'Clean' | 'Warning' | 'Error' | 'Pending';

export type StudentConfirmationStatus = 'Confirmed' | 'Pending' | 'Disputed';

export type CollegeStudent = {
  id: string;
  apaarId: string;
  name: string;
  programme: string;
  programmeCode: string;
  academicYear: string;
  quota: 'State Quota' | 'All India' | 'Management' | 'NRI';
  validationStatus: StudentValidationStatus;
  confirmationStatus: StudentConfirmationStatus;
  flags?: string[];
  batchId?: string;
  enrolledDate: string;
};

export type SeatAllocation = {
  programme: string;
  code: string;
  approvedIntake: number;
  enrolled: number;
  vacant: number;
};

export type CollegeDashboardMetrics = {
  totalSeats: number;
  totalEnrolled: number;
  totalClean: number;
  totalFlagged: number;
  totalConfirmed: number;
  totalPendingConfirmation: number;
  totalBatches: number;
};

