import {
  Activity,
  BadgeCheck,
  Bell,
  BookOpen,
  Building2,
  ChartNoAxesCombined,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileClock,
  FilePlus2,
  FileSearch,
  FileText,
  Flag,
  History,
  LayoutDashboard,
  QrCode,
  ScanLine,
  Settings,
  ShieldCheck,
  TriangleAlert,
  Upload,
  UserRound,
  Users,
} from 'lucide-react';
import type { ActivityItem, DemoRecord, NavigationItem, Role, RouteInfo } from '../types';

export const roleDetails: Record<Role, { label: string; summary: string; dashboard: string }> = {
  aicte: {
    label: 'AICTE',
    summary: 'Access the national oversight and monitoring interface.',
    dashboard: 'National oversight',
  },
  college: {
    label: 'College Official',
    summary: 'Access the institution-side student data management interface.',
    dashboard: 'Institution workspace',
  },
  student: {
    label: 'Candidate / Student',
    summary: 'Access the student-facing record, confirmation, transparency and verification interface.',
    dashboard: 'Your record overview',
  },
};

export const navigation: Record<Role, NavigationItem[]> = {
  aicte: [
    { path: '/aicte', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/aicte/institutions', label: 'Institutions', icon: Building2 },
    { path: '/aicte/students', label: 'Student Records', icon: Users },
    { path: '/aicte/warnings', label: 'Flagged Warnings', icon: TriangleAlert },
    { path: '/aicte/review', label: 'Review Queue', icon: ClipboardCheck },
    { path: '/aicte/risk', label: 'Risk Analytics', icon: ChartNoAxesCombined },
    { path: '/aicte/audit', label: 'Audit Trail', icon: FileClock },
    { path: '/aicte/reports', label: 'Reports', icon: FileBarChart },
    { path: '/aicte/verification', label: 'Verification', icon: BadgeCheck },
    { path: '/aicte/settings', label: 'Settings', icon: Settings },
  ],
  college: [
    { path: '/college', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/college/students', label: 'Student Records', icon: Users },
    { path: '/college/students/add', label: 'Add Student', icon: FilePlus2 },
    { path: '/college/students/upload', label: 'Upload Students', icon: Upload },
    { path: '/college/validation', label: 'Validation Results', icon: ClipboardCheck },
    { path: '/college/flagged', label: 'Flagged Records', icon: Flag },
    { path: '/college/submission', label: 'Submission Status', icon: FileClock },
    { path: '/college/confirmation', label: 'Student Confirmation', icon: UserRound },
    { path: '/college/credentials', label: 'QR / Credentials', icon: QrCode },
    { path: '/college/activity', label: 'Audit / Activity', icon: Activity },
    { path: '/college/settings', label: 'Settings', icon: Settings },
  ],
  student: [
    { path: '/student/profile', label: 'My Profile', icon: UserRound },
    { path: '/student/academic-record', label: 'My Academic Record', icon: BookOpen },
    { path: '/student/verification', label: 'Verification Status', icon: ShieldCheck },
    { path: '/student/activity', label: 'Data Activity', icon: Activity },
    { path: '/student/qr', label: 'My QR', icon: QrCode },
    { path: '/student/consent', label: 'Consent', icon: ScanLine },
    { path: '/student/documents', label: 'Documents', icon: FileText },
    { path: '/student/notifications', label: 'Notifications', icon: Bell },
    { path: '/student/verification-history', label: 'Verification History', icon: History },
    { path: '/student/settings', label: 'Settings', icon: Settings },
  ],
};

const publicRoutes: Record<string, RouteInfo> = {
  '/': { title: 'Home', description: 'APAAR-based student records prototype' },
  '/about': { title: 'About the platform', description: 'Purpose and participants' },
  '/security': { title: 'Security and privacy principles', description: 'Intended principles for future implementation' },
  '/login': { title: 'Login', description: 'Prototype sign-in entry' },
  '/prototype/access': { title: 'Choose your prototype role', description: 'Select a role simulation' },
  '/privacy': { title: 'Privacy Policy', description: 'Draft prototype content' },
  '/terms': { title: 'Terms & Conditions', description: 'Draft prototype content' },
  '/cookies': { title: 'Cookie Policy', description: 'Draft prototype content' },
  '/contact': { title: 'Contact', description: 'Contact information placeholder' },
};

const roleRoutes: Record<Role, [string, string, string][]> = {
  aicte: [
    ['/aicte', 'Dashboard', 'Prototype overview for national review'],
    ['/aicte/institutions', 'Institutions', 'Institution records are not connected in this prototype'],
    ['/aicte/students', 'Student Records', 'Synthetic record examples for the oversight interface'],
    ['/aicte/warnings', 'Flagged Warnings', 'Warning review is a planned workflow'],
    ['/aicte/review', 'Review Queue', 'Review queue is not active in this prototype'],
    ['/aicte/risk', 'Risk Analytics', 'Risk analysis is planned for a future phase'],
    ['/aicte/audit', 'Audit Trail', 'Audit events are not being recorded in this prototype'],
    ['/aicte/reports', 'Reports', 'Report generation is not available in this prototype'],
    ['/aicte/verification', 'Verification', 'Verification operations are not connected'],
    ['/aicte/settings', 'Settings', 'Account settings are not available in this prototype'],
  ],
  college: [
    ['/college', 'Dashboard', 'Institution workflow overview'],
    ['/college/students', 'Student Records', 'Synthetic record examples for the institution interface'],
    ['/college/students/add', 'Add Student', 'Student intake is not active in this prototype'],
    ['/college/students/upload', 'Upload Students', 'File uploads are not active in this prototype'],
    ['/college/validation', 'Validation Results', 'Validation rules are not connected'],
    ['/college/flagged', 'Flagged Records', 'Record flagging is not active in this prototype'],
    ['/college/submission', 'Submission Status', 'Submissions are not sent from this prototype'],
    ['/college/confirmation', 'Student Confirmation', 'Student confirmation is not active'],
    ['/college/credentials', 'QR / Credentials', 'Credential issuance is planned for a future phase'],
    ['/college/activity', 'Audit / Activity', 'Institution activity is not recorded in this prototype'],
    ['/college/settings', 'Settings', 'Institution settings are not available in this prototype'],
  ],
  student: [
    ['/student', 'Student overview', 'Prototype view of a student record'],
    ['/student/profile', 'My Profile', 'Profile details are not connected in this prototype'],
    ['/student/academic-record', 'My Academic Record', 'Synthetic academic record example'],
    ['/student/verification', 'Verification Status', 'Verification status is illustrative only'],
    ['/student/activity', 'Data Activity', 'Data activity is not being recorded in this prototype'],
    ['/student/qr', 'My QR', 'QR credentials are not issued by this prototype'],
    ['/student/consent', 'Consent', 'Consent preferences are not stored in this prototype'],
    ['/student/documents', 'Documents', 'Document access is not connected in this prototype'],
    ['/student/notifications', 'Notifications', 'Notifications are not sent in this prototype'],
    ['/student/verification-history', 'Verification History', 'No real verification history is available'],
    ['/student/settings', 'Settings', 'Student settings are not available in this prototype'],
  ],
};

export const routeInfo: Record<string, RouteInfo> = { ...publicRoutes };
for (const [role, entries] of Object.entries(roleRoutes) as [Role, typeof roleRoutes[Role]][]) {
  for (const [path, title, description] of entries) routeInfo[path] = { title, description, role };
}

export const demoRecords: DemoRecord[] = [
  {
    reference: 'STU-DEMO-104',
    programme: 'Engineering · sample programme',
    workflow: 'Student confirmation',
    status: 'Awaiting confirmation',
    updated: '22 Oct 2026',
  },
  {
    reference: 'STU-DEMO-218',
    programme: 'Applied sciences · sample programme',
    workflow: 'Record review',
    status: 'Validation review',
    updated: '21 Oct 2026',
  },
  {
    reference: 'STU-DEMO-327',
    programme: 'Management · sample programme',
    workflow: 'Institution submission',
    status: 'Ready for review',
    updated: '20 Oct 2026',
  },
];

export const demoActivity: ActivityItem[] = [
  {
    title: 'Example record prepared',
    detail: 'Synthetic information for this interface demonstration only.',
    time: '22 Oct 2026 · Demo event',
    icon: ClipboardList,
  },
  {
    title: 'Confirmation step shown',
    detail: 'No student notification was sent and no response was stored.',
    time: '21 Oct 2026 · Demo event',
    icon: UserRound,
  },
  {
    title: 'Review stage illustrated',
    detail: 'This status does not represent a real verification decision.',
    time: '20 Oct 2026 · Demo event',
    icon: FileSearch,
  },
];
