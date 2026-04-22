import { useState, useEffect } from 'react';
import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { sendContactForm } from '../../services/ContactService';
import type { ContactFormData, ContactFormProps, Objective, FormStatus, PlanKey } from './ContactForm.types';
import './ContactForm.scss';

const OBJECTIVES: Objective[] = ['fat_loss', 'muscle_gain', 'health'];
const PLAN_OPTIONS: PlanKey[] = [
  'nutrition_monthly', 'nutrition_quarterly', 'nutrition_semiannual',
  'training_monthly', 'training_quarterly', 'training_semiannual',
  'complete_monthly', 'complete_quarterly', 'complete_semiannual',
];

const OBJECTIVE_TO_GOAL: Record<Objective, string> = {
  fat_loss: 'Pérdida de grasa',
  muscle_gain: 'Masa muscular',
  health: 'Salud general',
};

const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const { t } = useI18n();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    objective: 'fat_loss',
    plan: '',
    message: '',
  });

  const [status, setStatus] = useState<FormStatus>('idle');

  /* Escuchar selección de plan desde PricingSection */
  useEffect(() => {
    const handlePlanSelect = (e: Event) => {
      const plan = (e as CustomEvent<PlanKey>).detail;
      if (plan) {
        setFormData((prev) => ({ ...prev, plan }));
      }
    };
    window.addEventListener('select-plan', handlePlanSelect);
    return () => window.removeEventListener('select-plan', handlePlanSelect);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await sendContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        goal: OBJECTIVE_TO_GOAL[formData.objective],
        message: formData.plan
          ? `[Plan: ${t(`contact.plan.${formData.plan}`)}] ${formData.message}`
          : formData.message,
      });

      if (response.success) {
        setStatus('success');
        onSubmit?.(formData);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  /* ── Success state ── */
  if (status === 'success') {
    return (
      <section className="hf-contact hf-contact--success" id="huberfit-contact">
        <div className="hf-contact__success">
          <span className="hf-contact__success-icon">✓</span>
          <h2 className="hf-contact__success-title">{t('contact.success.title')}</h2>
          <p className="hf-contact__success-body">{t('contact.success.body')}</p>
        </div>
      </section>
    );
  }

  /* ── Form state (idle | loading | error) ── */
  const isLoading = status === 'loading';
  const formRef = useScrollReveal<HTMLElement>();

  return (
    <section className="hf-contact sr" id="huberfit-contact" ref={formRef}>
      <h2 className="hf-contact__title">{t('contact.title')}</h2>
      <p className="hf-contact__subtitle">{t('contact.subtitle')}</p>

      {status === 'error' && (
        <div className="hf-contact__error" role="alert">
          {t('contact.error')}
        </div>
      )}

      <form className="hf-contact__form" onSubmit={handleSubmit} noValidate>
        <div className="hf-contact__field">
          <label htmlFor="hf-name">{t('contact.name')}</label>
          <input
            id="hf-name"
            name="name"
            type="text"
            required
            disabled={isLoading}
            autoComplete="name"
            placeholder={t('contact.name.placeholder')}
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="hf-contact__field">
          <label htmlFor="hf-email">{t('contact.email')}</label>
          <input
            id="hf-email"
            name="email"
            type="email"
            required
            disabled={isLoading}
            autoComplete="email"
            placeholder={t('contact.email.placeholder')}
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="hf-contact__field">
          <label htmlFor="hf-phone">{t('contact.phone')}</label>
          <input
            id="hf-phone"
            name="phone"
            type="tel"
            disabled={isLoading}
            autoComplete="tel"
            placeholder={t('contact.phone.placeholder')}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="hf-contact__field">
          <label htmlFor="hf-objective">{t('contact.objective')}</label>
          <select
            id="hf-objective"
            name="objective"
            disabled={isLoading}
            value={formData.objective}
            onChange={handleChange}
          >
            {OBJECTIVES.map((obj) => (
              <option key={obj} value={obj}>
                {t(`contact.objective.${obj}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="hf-contact__field">
          <label htmlFor="hf-plan">{t('contact.plan')}</label>
          <select
            id="hf-plan"
            name="plan"
            disabled={isLoading}
            value={formData.plan}
            onChange={handleChange}
          >
            <option value="">{t('contact.plan.placeholder')}</option>
            {PLAN_OPTIONS.map((plan) => (
              <option key={plan} value={plan}>
                {t(`contact.plan.${plan}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="hf-contact__field">
          <label htmlFor="hf-message">{t('contact.message')}</label>
          <textarea
            id="hf-message"
            name="message"
            rows={3}
            disabled={isLoading}
            placeholder={t('contact.message.placeholder')}
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        <button
          className={`hf-contact__submit${isLoading ? ' hf-contact__submit--loading' : ''}`}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? t('contact.submitting') : t('contact.submit')}
        </button>

        <p className="hf-contact__privacy">{t('contact.privacy')}</p>
      </form>
    </section>
  );
};

export default ContactForm;
