export type ServiceUnit =
  | 'Emergency Care'
  | 'Surgical Pathway'
  | 'Cardiology'
  | 'Oncology'
  | 'Maternity'
  | 'Mental Health'
  | 'Outpatient Clinics'
  | 'Diagnostics'
  | 'Community Care'
  | 'Rehabilitation';

export type CapacityStatus = 'OVER_CAPACITY' | 'AT_CAPACITY' | 'UNDER_CAPACITY';

export interface OperationalSnapshot {
  snapshotId: string;
  recordedAt: string;
  serviceUnit: ServiceUnit;
  demand: number;
  capacity: number;
  encounterCount: number;
  returnVisitCount: number;
  capacityStatus: CapacityStatus;
}
