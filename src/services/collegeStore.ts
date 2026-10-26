import { useEffect, useState } from 'react';
import type {
  ActivityItem,
  CollegeDashboardMetrics,
  CollegeStudent,
  SeatAllocation,
  StudentConfirmationStatus,
} from '../types';
import type { ApiEnvelope } from './api';

export const COLLEGE_PROFILE = {
  institutionId: 'AICTE-1-351294811',
  name: 'Dr. A.P.J. Abdul Kalam Institute of Technology',
  shortName: 'APJAKIT Lucknow',
  affiliatingUniversity: 'Dr. A.P.J. Abdul Kalam Technical University (AKTU)',
  academicCycle: '2026-2027',
  region: 'Northern Region',
  category: 'Engineering & Management',
  approvalStatus: 'AICTE Approved (EoA 2026-27)',
  nodalOfficer: 'Prof. S. K. Srivastava (Registrar)',
  contactEmail: 'nodal.aicte@apjakit.ac.in',
};

export const INITIAL_SEAT_ALLOCATIONS: SeatAllocation[] = [
  {
    programme: 'B.Tech - Computer Science & Engineering',
    code: 'CSE-101',
    approvedIntake: 120,
    enrolled: 118,
    vacant: 2,
  },
  {
    programme: 'B.Tech - Electronics & Communication',
    code: 'ECE-102',
    approvedIntake: 60,
    enrolled: 54,
    vacant: 6,
  },
  {
    programme: 'B.Tech - Mechanical Engineering',
    code: 'ME-103',
    approvedIntake: 60,
    enrolled: 48,
    vacant: 12,
  },
  {
    programme: 'Master of Business Administration (MBA)',
    code: 'MBA-201',
    approvedIntake: 60,
    enrolled: 60,
    vacant: 0,
  },
];

export const INITIAL_STUDENTS: CollegeStudent[] = [
  {
    id: 'STU-2026-001',
    apaarId: 'APAAR-2026-9812-4401',
    name: 'Aarav Sharma',
    programme: 'B.Tech - Computer Science & Engineering',
    programmeCode: 'CSE-101',
    academicYear: '2026-2027',
    quota: 'State Quota',
    validationStatus: 'Clean',
    confirmationStatus: 'Confirmed',
    batchId: 'BATCH-2026-01',
    enrolledDate: '12 Aug 2026',
  },
  {
    id: 'STU-2026-002',
    apaarId: 'APAAR-2026-9812-4402',
    name: 'Ananya Iyer',
    programme: 'B.Tech - Computer Science & Engineering',
    programmeCode: 'CSE-101',
    academicYear: '2026-2027',
    quota: 'All India',
    validationStatus: 'Clean',
    confirmationStatus: 'Confirmed',
    batchId: 'BATCH-2026-01',
    enrolledDate: '14 Aug 2026',
  },
  {
    id: 'STU-2026-003',
    apaarId: 'APAAR-2026-9812-4403',
    name: 'Rohan Verma',
    programme: 'B.Tech - Electronics & Communication',
    programmeCode: 'ECE-102',
    academicYear: '2026-2027',
    quota: 'State Quota',
    validationStatus: 'Warning',
    confirmationStatus: 'Pending',
    flags: ['Cross-institution duplicate check: simultaneous registration at GBTU-042'],
    batchId: 'BATCH-2026-01',
    enrolledDate: '16 Aug 2026',
  },
  {
    id: 'STU-2026-004',
    apaarId: 'APAAR-2026-9812-4404',
    name: 'Pooja Deshmukh',
    programme: 'Master of Business Administration (MBA)',
    programmeCode: 'MBA-201',
    academicYear: '2026-2027',
    quota: 'Management',
    validationStatus: 'Clean',
    confirmationStatus: 'Confirmed',
    batchId: 'BATCH-2026-02',
    enrolledDate: '20 Aug 2026',
  },
  {
    id: 'STU-2026-005',
    apaarId: 'APAAR-2026-9812-4405',
    name: 'Vikramaditya Rao',
    programme: 'B.Tech - Mechanical Engineering',
    programmeCode: 'ME-103',
    academicYear: '2026-2027',
    quota: 'State Quota',
    validationStatus: 'Clean',
    confirmationStatus: 'Pending',
    batchId: 'BATCH-2026-01',
    enrolledDate: '22 Aug 2026',
  },
  {
    id: 'STU-2026-006',
    apaarId: 'APAAR-2026-9812-4406',
    name: 'Sneha Patel',
    programme: 'B.Tech - Computer Science & Engineering',
    programmeCode: 'CSE-101',
    academicYear: '2026-2027',
    quota: 'State Quota',
    validationStatus: 'Error',
    confirmationStatus: 'Disputed',
    flags: ['APAAR format checksum failure', 'Mismatch between 10th marksheet name and APAAR ID'],
    batchId: 'BATCH-2026-02',
    enrolledDate: '25 Aug 2026',
  },
  {
    id: 'STU-2026-007',
    apaarId: 'APAAR-2026-9812-4407',
    name: 'Mohammed Zaid',
    programme: 'B.Tech - Electronics & Communication',
    programmeCode: 'ECE-102',
    academicYear: '2026-2027',
    quota: 'State Quota',
    validationStatus: 'Clean',
    confirmationStatus: 'Confirmed',
    batchId: 'BATCH-2026-01',
    enrolledDate: '28 Aug 2026',
  },
  {
    id: 'STU-2026-008',
    apaarId: 'APAAR-2026-9812-4408',
    name: 'Kavya Nair',
    programme: 'Master of Business Administration (MBA)',
    programmeCode: 'MBA-201',
    academicYear: '2026-2027',
    quota: 'All India',
    validationStatus: 'Warning',
    confirmationStatus: 'Pending',
    flags: ['Category certificate verification pending with State Welfare portal'],
    batchId: 'BATCH-2026-02',
    enrolledDate: '01 Sep 2026',
  },
];

export const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    title: 'Automated Validation Sweep Finished',
    detail: '280 student records scanned against AICTE intake caps and APAAR formats. 12 warnings flagged.',
    time: '25 Oct 2026, 18:30 · System',
  },
  {
    title: 'Submission Batch BATCH-2026-01 Prepared',
    detail: 'Batch of 180 verified records locked for official AICTE submission review.',
    time: '24 Oct 2026, 14:15 · Registrar Office',
  },
  {
    title: 'Student Confirmation Registered',
    detail: 'Candidate Aarav Sharma confirmed enrolment record via APAAR credentials.',
    time: '24 Oct 2026, 11:20 · Student Portal',
  },
  {
    title: 'Dual Enrolment Anomaly Flagged',
    detail: 'Cross-institution check raised Warning for APAAR-2026-9812-4403.',
    time: '23 Oct 2026, 16:45 · AICTE Validation Service',
  },
];

const STORAGE_KEYS = {
  students: 'sudarshan_college_students_v2',
  seats: 'sudarshan_college_seats_v2',
  activity: 'sudarshan_college_activity_v2',
};

// In-memory singletons initialized from localStorage or defaults
function loadInitialStudents(): CollegeStudent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.students);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage unavailable
  }
  return [...INITIAL_STUDENTS];
}

function loadInitialSeats(): SeatAllocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.seats);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage unavailable
  }
  return [...INITIAL_SEAT_ALLOCATIONS];
}

function loadInitialActivity(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.activity);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage unavailable
  }
  return [...INITIAL_ACTIVITY];
}

let storedStudents: CollegeStudent[] = loadInitialStudents();
let storedSeats: SeatAllocation[] = loadInitialSeats();
let storedActivity: ActivityItem[] = loadInitialActivity();

const listeners = new Set<() => void>();

function notifyListeners() {
  try {
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(storedStudents));
    localStorage.setItem(STORAGE_KEYS.seats, JSON.stringify(storedSeats));
    localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(storedActivity));
  } catch {
    // Ignore storage quota or disabled storage
  }
  listeners.forEach((callback) => callback());
}

export function subscribeCollegeStore(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export type AddStudentInput = {
  apaarId: string;
  name: string;
  programmeCode: string;
  quota: 'State Quota' | 'All India' | 'Management' | 'NRI';
  academicYear?: string;
  batchId?: string;
};

export type AddStudentResult = {
  success: boolean;
  student?: CollegeStudent;
  errors?: Record<string, string>;
};

export const collegeService = {
  getProfile(): ApiEnvelope<typeof COLLEGE_PROFILE> {
    return { data: COLLEGE_PROFILE };
  },

  getDashboardMetrics(): ApiEnvelope<CollegeDashboardMetrics> {
    const totalSeats = storedSeats.reduce((acc, s) => acc + s.approvedIntake, 0);
    const totalEnrolled = storedStudents.length;
    const totalClean = storedStudents.filter((s) => s.validationStatus === 'Clean').length;
    const totalFlagged = storedStudents.filter(
      (s) => s.validationStatus === 'Warning' || s.validationStatus === 'Error',
    ).length;
    const totalConfirmed = storedStudents.filter(
      (s) => s.confirmationStatus === 'Confirmed',
    ).length;
    const totalPendingConfirmation = storedStudents.filter(
      (s) => s.confirmationStatus === 'Pending',
    ).length;

    return {
      data: {
        totalSeats,
        totalEnrolled,
        totalClean,
        totalFlagged,
        totalConfirmed,
        totalPendingConfirmation,
        totalBatches: 2,
      },
    };
  },

  getSeatAllocations(): ApiEnvelope<SeatAllocation[]> {
    return { data: [...storedSeats] };
  },

  getStudents(filter?: {
    tab?: 'all' | 'flagged' | 'pending' | 'clean';
    query?: string;
  }): ApiEnvelope<CollegeStudent[]> {
    let result = [...storedStudents];

    if (filter?.tab === 'flagged') {
      result = result.filter(
        (s) => s.validationStatus === 'Warning' || s.validationStatus === 'Error',
      );
    } else if (filter?.tab === 'pending') {
      result = result.filter((s) => s.confirmationStatus === 'Pending');
    } else if (filter?.tab === 'clean') {
      result = result.filter((s) => s.validationStatus === 'Clean');
    }

    if (filter?.query && filter.query.trim() !== '') {
      const q = filter.query.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.apaarId.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.programme.toLowerCase().includes(q) ||
          s.programmeCode.toLowerCase().includes(q) ||
          s.quota.toLowerCase().includes(q),
      );
    }

    return { data: result };
  },

  getRecentActivity(): ApiEnvelope<ActivityItem[]> {
    return { data: [...storedActivity] };
  },

  addStudent(input: AddStudentInput): AddStudentResult {
    const errors: Record<string, string> = {};

    // Normalize inputs
    const trimmedApaar = input.apaarId.trim().toUpperCase();
    const trimmedName = input.name.trim();

    // 1. Validate APAAR ID
    if (!trimmedApaar) {
      errors.apaarId = 'APAAR ID is mandatory.';
    } else {
      // Clean digits or formatted pattern
      const digitsOnly = trimmedApaar.replace(/\D/g, '');
      const isStandardSynthetic = /^APAAR-\d{4}-\d{4}-\d{4}$/i.test(trimmedApaar);
      const isTwelveDigit = digitsOnly.length === 12;

      if (!isStandardSynthetic && !isTwelveDigit) {
        errors.apaarId =
          'Invalid APAAR ID format. Must be 12 digits (e.g. 1234 5678 9012) or demo format (e.g. APAAR-2026-9812-4410).';
      } else {
        // Check duplicate
        const exists = storedStudents.some(
          (s) =>
            s.apaarId.toLowerCase() === trimmedApaar.toLowerCase() ||
            (digitsOnly.length === 12 && s.apaarId.replace(/\D/g, '') === digitsOnly),
        );
        if (exists) {
          errors.apaarId =
            'A candidate with this APAAR ID already exists in the institutional registry.';
        }
      }
    }

    // 2. Validate Candidate Name
    if (!trimmedName) {
      errors.name = 'Candidate full name is mandatory.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Candidate name must contain at least 2 characters.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      errors.name = 'Candidate name should only contain letters, spaces, or dots.';
    }

    // 3. Validate Programme
    const matchedSeat = storedSeats.find((s) => s.code === input.programmeCode);
    if (!matchedSeat) {
      errors.programmeCode = 'Please select a valid AICTE-approved programme.';
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Determine validation flags and status
    const flags: string[] = [];
    let validationStatus: 'Clean' | 'Warning' = 'Clean';

    if (matchedSeat && matchedSeat.vacant <= 0) {
      flags.push('Seat cap overrun: Enrolment exceeds approved AICTE intake for this programme.');
      validationStatus = 'Warning';
    }

    const newId = `STU-2026-${String(storedStudents.length + 1).padStart(3, '0')}`;
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newStudent: CollegeStudent = {
      id: newId,
      apaarId: trimmedApaar,
      name: trimmedName,
      programme: matchedSeat ? matchedSeat.programme : input.programmeCode,
      programmeCode: input.programmeCode,
      academicYear: input.academicYear || '2026-2027',
      quota: input.quota,
      validationStatus,
      confirmationStatus: 'Pending',
      flags: flags.length > 0 ? flags : undefined,
      batchId: input.batchId || 'BATCH-2026-02',
      enrolledDate: today,
    };

    // Prepend new student so it appears at the top
    storedStudents = [newStudent, ...storedStudents];

    // Update seat counts
    if (matchedSeat) {
      storedSeats = storedSeats.map((seat) => {
        if (seat.code === matchedSeat.code) {
          const newEnrolled = seat.enrolled + 1;
          const newVacant = Math.max(0, seat.approvedIntake - newEnrolled);
          return { ...seat, enrolled: newEnrolled, vacant: newVacant };
        }
        return seat;
      });
    }

    // Add activity record
    const newActivity: ActivityItem = {
      title: 'Manual Student Intake Completed',
      detail: `Registered ${trimmedName} (${trimmedApaar}) under ${matchedSeat?.programme || input.programmeCode}.`,
      time: `Just now · Registrar Office`,
    };
    storedActivity = [newActivity, ...storedActivity];

    notifyListeners();

    return {
      success: true,
      student: newStudent,
    };
  },

  addStudentsBulk(inputs: AddStudentInput[]): {
    success: boolean;
    addedCount: number;
    addedStudents: CollegeStudent[];
  } {
    if (inputs.length === 0) {
      return { success: true, addedCount: 0, addedStudents: [] };
    }

    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const addedStudents: CollegeStudent[] = [];
    const seatIncrements: Record<string, number> = {};

    inputs.forEach((input, index) => {
      const trimmedApaar = input.apaarId.trim().toUpperCase();
      const trimmedName = input.name.trim();
      const matchedSeat = storedSeats.find((s) => s.code === input.programmeCode);

      const flags: string[] = [];
      let validationStatus: 'Clean' | 'Warning' = 'Clean';

      if (matchedSeat && matchedSeat.vacant <= 0) {
        flags.push('Seat cap overrun: Enrolment exceeds approved AICTE intake for this programme.');
        validationStatus = 'Warning';
      }

      const newId = `STU-2026-${String(storedStudents.length + 1 + index).padStart(3, '0')}`;
      const student: CollegeStudent = {
        id: newId,
        apaarId: trimmedApaar,
        name: trimmedName,
        programme: matchedSeat ? matchedSeat.programme : input.programmeCode,
        programmeCode: input.programmeCode,
        academicYear: input.academicYear || '2026-2027',
        quota: input.quota,
        validationStatus,
        confirmationStatus: 'Pending',
        flags: flags.length > 0 ? flags : undefined,
        batchId: input.batchId || 'BATCH-2026-02',
        enrolledDate: today,
      };

      addedStudents.push(student);
      seatIncrements[input.programmeCode] = (seatIncrements[input.programmeCode] || 0) + 1;
    });

    // Prepend newly added students
    storedStudents = [...addedStudents, ...storedStudents];

    // Update seat counts
    storedSeats = storedSeats.map((seat) => {
      const count = seatIncrements[seat.code] || 0;
      if (count > 0) {
        const newEnrolled = seat.enrolled + count;
        const newVacant = Math.max(0, seat.approvedIntake - newEnrolled);
        return { ...seat, enrolled: newEnrolled, vacant: newVacant };
      }
      return seat;
    });

    // Add activity record
    const newActivity: ActivityItem = {
      title: 'Bulk CSV Intake Completed',
      detail: `Successfully imported ${addedStudents.length} candidate enrolment records via CSV file upload.`,
      time: `Just now · Registrar Office`,
    };
    storedActivity = [newActivity, ...storedActivity];

    notifyListeners();

    return {
      success: true,
      addedCount: addedStudents.length,
      addedStudents,
    };
  },

  getExistingApaarIds(): Set<string> {
    const set = new Set<string>();
    storedStudents.forEach((s) => {
      set.add(s.apaarId.trim().toUpperCase());
      const digits = s.apaarId.replace(/\D/g, '');
      if (digits.length === 12) set.add(digits);
    });
    return set;
  },

  resetStore() {
    storedStudents = [...INITIAL_STUDENTS];
    storedSeats = [...INITIAL_SEAT_ALLOCATIONS];
    storedActivity = [...INITIAL_ACTIVITY];
    notifyListeners();
  },

  updateConfirmationStatus(
    studentId: string,
    newStatus: StudentConfirmationStatus,
  ): { success: boolean; error?: string } {
    const index = storedStudents.findIndex((s) => s.id === studentId);
    if (index === -1) {
      return { success: false, error: 'Student record not found.' };
    }

    const student = storedStudents[index];
    const previousStatus = student.confirmationStatus;
    if (previousStatus === newStatus) {
      return { success: false, error: `Status is already ${newStatus}.` };
    }

    storedStudents = storedStudents.map((s) =>
      s.id === studentId ? { ...s, confirmationStatus: newStatus } : s,
    );

    const newActivity: ActivityItem = {
      title: 'Student Confirmation Updated',
      detail: `${student.name} (${student.apaarId}) status changed from ${previousStatus} to ${newStatus}.`,
      time: `Just now · Registrar Office`,
    };
    storedActivity = [newActivity, ...storedActivity];

    notifyListeners();
    return { success: true };
  },
};

export function useCollegeData() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeCollegeStore(() => {
      setTick((t) => t + 1);
    });
  }, []);

  return {
    profile: collegeService.getProfile().data,
    metrics: collegeService.getDashboardMetrics().data,
    seatAllocations: collegeService.getSeatAllocations().data,
    activity: collegeService.getRecentActivity().data,
    getExistingApaarIds: () => collegeService.getExistingApaarIds(),
    getStudents: (filter?: { tab?: 'all' | 'flagged' | 'pending' | 'clean'; query?: string }) =>
      collegeService.getStudents(filter).data,
  };
}
