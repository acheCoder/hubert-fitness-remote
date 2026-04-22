export type Objective = 'fat_loss' | 'muscle_gain' | 'health';
export type PlanKey =
  | 'nutrition_monthly' | 'nutrition_quarterly' | 'nutrition_semiannual'
  | 'training_monthly' | 'training_quarterly' | 'training_semiannual'
  | 'complete_monthly' | 'complete_quarterly' | 'complete_semiannual'
  | '';
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  objective: Objective;
  plan: PlanKey;
  message: string;
}

export interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
}
