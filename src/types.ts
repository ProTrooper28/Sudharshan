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
