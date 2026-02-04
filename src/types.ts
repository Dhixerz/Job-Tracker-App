export type JobStatus =
  | 'Applied'
  | 'Initial Call'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Role Filled';

export interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  dateApplied: string;
  link: string;

  // New Fields
  team?: string;
  referral?: string;
  yearsOfExperience?: string; // Stored as string but input restricted to numbers
  salary?: string;            // Stored as string but input restricted to numbers
  salaryCurrency?: string;    // New field for currency code (e.g., USD, EUR)

  location?: string;
  locationType?: 'Remote' | 'Hybrid' | 'Onsite';
  pointOfContact?: string;
  notes?: string;
}

export const COLUMNS: { id: JobStatus; title: string; color: string }[] = [
  { id: 'Applied', title: 'Applied', color: '#3b82f6' },
  { id: 'Initial Call', title: 'Initial Call', color: '#8b5cf6' },
  { id: 'Interview', title: 'Interview', color: '#eab308' },
  { id: 'Offer', title: 'Offer', color: '#22c55e' },
  { id: 'Rejected', title: 'Rejected', color: '#ef4444' },
  { id: 'Role Filled', title: 'Role Filled', color: '#64748b' },
];
export interface FilterState {
  company: string;
  locationTypes: ('Remote' | 'Hybrid' | 'Onsite')[];
  salary: {
    amount: string;
    currency: string;
    operator: '>=' | '<=' | '=';
  };
  experience: {
    years: string;
    operator: '>=' | '<=' | '=';
  };
  dateApplied: {
    value: string; // Date string YYYY-MM-DD
    operator: 'before' | 'after' | 'on' | '';
  };
}
