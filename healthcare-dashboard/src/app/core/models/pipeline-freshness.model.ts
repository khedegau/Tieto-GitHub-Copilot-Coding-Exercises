export type PipelineStatus = 'FRESH' | 'STALE' | 'MISSING';

export interface PipelineFreshness {
  sourceSystem: string;
  lastIngestedAt: string | null;
  expectedFrequencyMinutes: number;
  status: PipelineStatus;
  recordCount: number;
}
