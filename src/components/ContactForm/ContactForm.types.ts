export type Objective = 'fat_loss' | 'muscle_gain' | 'health';
export type TrainingDays = '1-2' | '3-4' | '5-6';
export type Timeframe = '2_weeks' | '3_months' | '6_months';
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';
export type BillingPeriod = 'monthly' | 'quarterly' | 'semiannual';
export type PlanBase = 'nutrition' | 'training' | 'complete';
export type PrescribedPlan = 'complete_monthly' | 'complete_quarterly' | 'complete_semiannual';
export type SelectablePlan = string; // e.g. 'complete_semiannual', 'nutrition_quarterly'

export interface IntakeFormData {
  objective: Objective | null;
  trainingDays: TrainingDays | null;
  timeframe: Timeframe | null;
  pesoActual: string;
  pesoObjetivo: string;
  name: string;
  email: string;
}

export interface ContactFormProps {
  onSubmit?: (data: IntakeFormData) => void;
}
