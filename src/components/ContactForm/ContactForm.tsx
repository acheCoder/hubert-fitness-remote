import { useState, useCallback, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { sendContactForm } from '../../services/ContactService';
import type {
  IntakeFormData,
  ContactFormProps,
  Objective,
  TrainingDays,
  Timeframe,
  FormStatus,
  PrescribedPlan,
  SelectablePlan,
  BillingPeriod,
  PlanBase,
} from './ContactForm.types';
import './ContactForm.scss';

/* ── Constantes ── */
const OBJECTIVES: Objective[] = ['fat_loss', 'muscle_gain', 'health'];
const TRAINING_DAYS: TrainingDays[] = ['1-2', '3-4', '5-6'];
const TIMEFRAMES: Timeframe[] = ['2_weeks', '3_months', '6_months'];

/* ── Configuración de precios (planes principales del funnel) ── */
const CORE_PLAN_CONFIG: Record<string, { totalPrice: number; months: number; monthlyEquiv: number; nameKey: string }> = {
  complete_semiannual: { totalPrice: 360, months: 6, monthlyEquiv: 60, nameKey: 'intake.prescription.complete_semiannual.name' },
  complete_quarterly: { totalPrice: 190, months: 3, monthlyEquiv: 63, nameKey: 'intake.prescription.complete_quarterly.name' },
  complete_monthly: { totalPrice: 75, months: 1, monthlyEquiv: 75, nameKey: 'pricing.complete.name' },
  nutrition_monthly: { totalPrice: 45, months: 1, monthlyEquiv: 45, nameKey: 'pricing.nutrition.name' },
  nutrition_quarterly: { totalPrice: 115, months: 3, monthlyEquiv: 38, nameKey: 'pricing.nutrition.name' },
  nutrition_semiannual: { totalPrice: 215, months: 6, monthlyEquiv: 36, nameKey: 'pricing.nutrition.name' },
  training_monthly: { totalPrice: 45, months: 1, monthlyEquiv: 45, nameKey: 'pricing.training.name' },
  training_quarterly: { totalPrice: 115, months: 3, monthlyEquiv: 38, nameKey: 'pricing.training.name' },
  training_semiannual: { totalPrice: 215, months: 6, monthlyEquiv: 36, nameKey: 'pricing.training.name' },
};
const ANCHOR_MONTHLY = 75;
const FEAT_COUNT = 4;
const CATALOG_PLANS: PlanBase[] = ['nutrition', 'training', 'complete'];
const BILLING_PERIODS: BillingPeriod[] = ['monthly', 'quarterly', 'semiannual'];

/* ── Algoritmo de prescripción (función pura, testeable) ── */
function calculateRecommendedPlan(
  objetivo: Objective | null,
  pesoActual: number,
  pesoObjetivo: number,
): PrescribedPlan {
  const diff = Math.abs(pesoActual - pesoObjetivo);

  if (objetivo === 'muscle_gain') {
    return diff > 4 ? 'complete_semiannual' : 'complete_quarterly';
  }

  if (objetivo === 'fat_loss') {
    if (diff >= 10) return 'complete_semiannual';
    if (diff >= 3) return 'complete_quarterly';
    return 'complete_monthly';
  }

  // objetivo === 'health' o fallback
  return 'complete_quarterly';
}

/* ── Animación slide ── */
const slideVariants = {
  enter: (dir: 1 | -1) => ({ x: dir * 50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 1 | -1) => ({ x: dir * -50, opacity: 0 }),
};
const transition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const };

const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const { t } = useI18n();
  const sectionRef = useScrollReveal<HTMLElement>();
  const funnelRef = useRef<HTMLElement>(null);

  /* ── Estado centralizado ── */
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [status, setStatus] = useState<FormStatus>('idle');

  const [formData, setFormData] = useState<IntakeFormData>({
    objective: null,
    trainingDays: null,
    timeframe: null,
    pesoActual: '',
    pesoObjetivo: '',
    name: '',
    email: '',
  });
  const [prescribedPlan, setPrescribedPlan] = useState<PrescribedPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SelectablePlan | null>(null);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [expandedBilling, setExpandedBilling] = useState<BillingPeriod>('monthly');
  const formRef = useRef<HTMLDivElement>(null);
  const [highlightForm, setHighlightForm] = useState(false);

  /* ── Navegación ── */
  const goTo = useCallback((next: number, dir: 1 | -1 = 1) => {
    setDirection(dir);
    setStep(next);
  }, []);

  /* ── Auto-scroll al inicio del funnel al cambiar de paso ── */
  useEffect(() => {
    if (step > 0 && funnelRef.current) {
      setTimeout(() => {
        const element = funnelRef.current;
        if (element) {
          const yOffset = -80;
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  }, [step]);

  /* ── Puerta lógica + Prescripción ── */
  const evaluate = useCallback(() => {
    if (formData.trainingDays === '1-2' || formData.timeframe === '2_weeks') {
      goTo(-1);
      return;
    }
    const actual = parseFloat(formData.pesoActual) || 0;
    const objetivo = parseFloat(formData.pesoObjetivo) || 0;
    const recommended = calculateRecommendedPlan(formData.objective, actual, objetivo);
    setPrescribedPlan(recommended);
    setSelectedPlan(recommended);
    goTo(2);
  }, [formData.objective, formData.trainingDays, formData.timeframe, formData.pesoActual, formData.pesoObjetivo, goTo]);

  /* ── Scroll al formulario si no está completo ── */
  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightForm(true);
    setTimeout(() => setHighlightForm(false), 2000);
  }, []);

  /* ── Submit final consolidado ── */
  const handleFinalSubmit = useCallback(async (e?: FormEvent) => {
    e?.preventDefault();
    if (!selectedPlan) return;
    if (!formData.name.trim() || !formData.email.trim()) {
      scrollToForm();
      return;
    }
    setStatus('loading');

    const config = CORE_PLAN_CONFIG[selectedPlan];
    const objectiveLabel = formData.objective ? t(`intake.q1.${formData.objective}`) : '';
    const daysLabel = formData.trainingDays ? t(`intake.q2.${formData.trainingDays}`) : '';
    const timeLabel = formData.timeframe ? t(`intake.q3.${formData.timeframe}`) : '';

    const pesoActual = parseFloat(formData.pesoActual) || 0;
    const pesoObjetivo = parseFloat(formData.pesoObjetivo) || 0;
    const diff = Math.abs(pesoActual - pesoObjetivo);

    const planName = `${t(config.nameKey)} — ${config.totalPrice}€ (${config.monthlyEquiv}€/mes)`;

    const structuredMessage = [
      '--- REPORTE DE CALIFICACIÓN AXIOM/FIT ---',
      `PLAN ELEGIDO: ${planName}`,
      `OBJETIVO: ${objectiveLabel}`,
      `DÍAS DE ENTRENAMIENTO: ${daysLabel}`,
      `EXPECTATIVA DE RESULTADOS: ${timeLabel}`,
      `PESO ACTUAL: ${pesoActual} kg | PESO OBJETIVO: ${pesoObjetivo} kg`,
      `DIFERENCIA A TRABAJAR: ${Math.round(diff)} kg`,
      '-----------------------------------------',
    ].join('\n');

    try {
      const response = await sendContactForm({
        name: formData.name,
        email: formData.email,
        phone: '',
        goal: objectiveLabel,
        message: structuredMessage,
        subject: `[SOLICITUD ASESORÍA] - ${formData.name} - ${planName}`,
        from_name: 'HubertFit Funnel',
      });

      if (response.success) {
        setStatus('success');
        goTo(3);
        onSubmit?.(formData);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }, [formData, selectedPlan, t, goTo, onSubmit, scrollToForm]);

  /* ── Helpers ── */
  const isStep1Complete =
    formData.objective && formData.trainingDays && formData.timeframe &&
    formData.pesoActual.trim() && formData.pesoObjetivo.trim();
  const isLoading = status === 'loading';

  /* ── Datos de prescripción ── */
  const planConfig = prescribedPlan ? CORE_PLAN_CONFIG[prescribedPlan] : null;
  const weightDiff = Math.abs(
    (parseFloat(formData.pesoActual) || 0) - (parseFloat(formData.pesoObjetivo) || 0),
  );
  const savings = planConfig ? ANCHOR_MONTHLY * planConfig.months - planConfig.totalPrice : 0;

  return (
    <section className="hf-contact sr" id="huberfit-contact" ref={(el) => { sectionRef.current = el; funnelRef.current = el; }}>
      {/* ── Progress (pasos 0-2) ── */}
      {step >= 0 && step <= 2 && (
        <div className="hf-contact__progress">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`hf-contact__progress-dot${i <= step ? ' hf-contact__progress-dot--active' : ''}`}
            />
          ))}
        </div>
      )}

      <div className={`hf-contact__container${step === 2 ? ' hf-contact__container--wide' : ''}`}>
        <AnimatePresence mode="wait" custom={direction}>

          {/* ═══════ PASO 0 — Hook ═══════ */}
          {step === 0 && (
            <motion.div
              key="step0"
              className="hf-contact__step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <h2 className="hf-contact__title">{t('intake.hook.title')}</h2>
              <p className="hf-contact__subtitle">{t('intake.hook.subtitle')}</p>
              <button
                type="button"
                className="hf-contact__submit"
                onClick={() => goTo(1)}
              >
                {t('intake.hook.cta')}
              </button>
            </motion.div>
          )}

          {/* ═══════ PASO 1 — Calificación (3 preguntas en una pantalla) ═══════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              className="hf-contact__step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <h2 className="hf-contact__title">{t('intake.qualify.title')}</h2>

              {/* ── Q1: Objetivo ── */}
              <div className="hf-contact__question">
                <span className="hf-contact__question-label">{t('intake.q1.label')}</span>
                <div className="hf-contact__options">
                  {OBJECTIVES.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`hf-contact__option${formData.objective === opt ? ' hf-contact__option--selected' : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, objective: opt }))}
                    >
                      <span className="hf-contact__option-icon">{t(`intake.q1.${opt}.icon`)}</span>
                      <span className="hf-contact__option-label">{t(`intake.q1.${opt}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Q2: Días de entrenamiento ── */}
              <div className="hf-contact__question">
                <span className="hf-contact__question-label">{t('intake.q2.label')}</span>
                <div className="hf-contact__options">
                  {TRAINING_DAYS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`hf-contact__option${formData.trainingDays === opt ? ' hf-contact__option--selected' : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, trainingDays: opt }))}
                    >
                      <span className="hf-contact__option-icon">{t(`intake.q2.${opt}.icon`)}</span>
                      <span className="hf-contact__option-label">{t(`intake.q2.${opt}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Q3: Expectativas ── */}
              <div className="hf-contact__question">
                <span className="hf-contact__question-label">{t('intake.q3.label')}</span>
                <div className="hf-contact__options">
                  {TIMEFRAMES.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`hf-contact__option${formData.timeframe === opt ? ' hf-contact__option--selected' : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, timeframe: opt }))}
                    >
                      <span className="hf-contact__option-icon">{t(`intake.q3.${opt}.icon`)}</span>
                      <span className="hf-contact__option-label">{t(`intake.q3.${opt}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Q4: Peso ── */}
              <div className="hf-contact__question">
                <span className="hf-contact__question-label">{t('intake.weight.label')}</span>
                <div className="hf-contact__weight-row">
                  <div className="hf-contact__field">
                    <label htmlFor="hf-peso-actual">{t('intake.weight.actual')}</label>
                    <input
                      id="hf-peso-actual"
                      type="number"
                      inputMode="decimal"
                      min="30"
                      max="300"
                      placeholder={t('intake.weight.actual.placeholder')}
                      value={formData.pesoActual}
                      onChange={(e) => setFormData((p) => ({ ...p, pesoActual: e.target.value }))}
                    />
                  </div>
                  <div className="hf-contact__field">
                    <label htmlFor="hf-peso-objetivo">{t('intake.weight.objetivo')}</label>
                    <input
                      id="hf-peso-objetivo"
                      type="number"
                      inputMode="decimal"
                      min="30"
                      max="300"
                      placeholder={t('intake.weight.objetivo.placeholder')}
                      value={formData.pesoObjetivo}
                      onChange={(e) => setFormData((p) => ({ ...p, pesoObjetivo: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* ── Nav ── */}
              <div className="hf-contact__nav">
                <button type="button" className="hf-contact__back" onClick={() => goTo(0, -1)}>
                  {t('intake.back')}
                </button>
                <button
                  type="button"
                  className={`hf-contact__submit hf-contact__submit--compact${!isStep1Complete ? ' hf-contact__submit--disabled' : ''}`}
                  disabled={!isStep1Complete}
                  onClick={evaluate}
                >
                  {t('intake.next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════ RECHAZO (step === -1) ═══════ */}
          {step === -1 && (
            <motion.div
              key="rejected"
              className="hf-contact__step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <div className="hf-contact__result hf-contact__result--rejected">
                <span className="hf-contact__result-icon">✗</span>
                <h2 className="hf-contact__result-title">{t('intake.rejected.title')}</h2>
                <p className="hf-contact__result-body">{t('intake.rejected.body')}</p>
                <button
                  type="button"
                  className="hf-contact__back"
                  onClick={() => {
                    setFormData({ objective: null, trainingDays: null, timeframe: null, pesoActual: '', pesoObjetivo: '', name: '', email: '' });
                    goTo(0, -1);
                  }}
                >
                  {t('intake.rejected.retry')}
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════ PASO 2 — Selección de plan + Datos + Envío ═══════ */}
          {step === 2 && prescribedPlan && planConfig && (
            <motion.div
              key="step2"
              className="hf-contact__step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <div className="hf-contact__approved-badge">✓ {t('intake.approved.badge')}</div>
              <h2 className="hf-contact__title">{t('intake.prescription.title')}</h2>
              <p className="hf-contact__subtitle">{t('intake.prescription.subtitle')}</p>

              {/* ── Pricing Grid — Tarjetas seleccionables ── */}
              <div className="hf-contact__pricing-grid" role="radiogroup" aria-label={t('intake.prescription.title')}>
                {/* Ancla — Plan Mensual (solo si la prescripción NO es mensual) */}
                {prescribedPlan !== 'complete_monthly' && (
                  <article
                    className={`hf-contact__pricing-card${selectedPlan === 'complete_monthly' ? ' hf-contact__pricing-card--selected' : ' hf-contact__pricing-card--dimmed'}`}
                    role="radio"
                    aria-checked={selectedPlan === 'complete_monthly'}
                    tabIndex={0}
                    onClick={() => setSelectedPlan('complete_monthly')}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('complete_monthly')}
                  >
                    <h3 className="hf-contact__pricing-plan">{t('intake.anchor.name')}</h3>
                    <div className="hf-contact__pricing-price-block">
                      <span className="hf-contact__pricing-amount">{ANCHOR_MONTHLY}</span>
                      <div className="hf-contact__pricing-meta">
                        <span className="hf-contact__pricing-currency">€</span>
                        <span className="hf-contact__pricing-period">{t('intake.anchor.period')}</span>
                      </div>
                    </div>
                    <ul className="hf-contact__pricing-features">
                      {Array.from({ length: FEAT_COUNT }, (_, i) => (
                        <li key={i}>
                          <span className="hf-contact__pricing-check">✓</span>
                          {t(`pricing.complete.feat_${i + 1}`)}
                        </li>
                      ))}
                    </ul>
                    <span className="hf-contact__pricing-select-label">
                      {selectedPlan === 'complete_monthly' ? t('intake.selected') : t('intake.select')}
                    </span>
                  </article>
                )}

                {/* Prescripción — Plan Recomendado */}
                <article
                  className={`hf-contact__pricing-card${selectedPlan === prescribedPlan ? ' hf-contact__pricing-card--selected' : ' hf-contact__pricing-card--dimmed'}${selectedPlan === prescribedPlan ? ' hf-contact__pricing-card--featured' : ''}`}
                  role="radio"
                  aria-checked={selectedPlan === prescribedPlan}
                  tabIndex={0}
                  onClick={() => setSelectedPlan(prescribedPlan)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan(prescribedPlan)}
                >
                  <span className="hf-contact__pricing-badge">
                    {t(`intake.prescription.badge.${formData.objective || 'health'}`).replace('{kg}', String(Math.round(weightDiff)))}
                  </span>
                  {savings > 0 && (
                    <span className="hf-contact__pricing-badge hf-contact__pricing-badge--savings">
                      {t('intake.prescription.savings').replace('{amount}', String(savings))}
                    </span>
                  )}
                  <h3 className="hf-contact__pricing-plan">{t(`intake.prescription.${prescribedPlan}.name`)}</h3>
                  <div className="hf-contact__pricing-price-block">
                    {prescribedPlan !== 'complete_monthly' && (
                      <span className="hf-contact__pricing-old">{ANCHOR_MONTHLY}€</span>
                    )}
                    <span className="hf-contact__pricing-amount hf-contact__pricing-amount--accent">
                      {planConfig.monthlyEquiv}
                    </span>
                    <div className="hf-contact__pricing-meta">
                      <span className="hf-contact__pricing-currency">€</span>
                      <span className="hf-contact__pricing-period">{t('intake.anchor.period')}</span>
                    </div>
                  </div>
                  <p className="hf-contact__pricing-billing">
                    {t(`intake.prescription.billing.${prescribedPlan}`)}
                  </p>
                  <ul className="hf-contact__pricing-features">
                    {Array.from({ length: FEAT_COUNT }, (_, i) => (
                      <li key={i}>
                        <span className="hf-contact__pricing-check">✓</span>
                        {t(`pricing.complete.feat_${i + 1}`)}
                      </li>
                    ))}
                  </ul>
                  <span className="hf-contact__pricing-select-label">
                    {selectedPlan === prescribedPlan ? t('intake.selected') : t('intake.select')}
                  </span>
                </article>
              </div>

              {/* ── Toggle "Ver otras ofertas" ── */}
              <button
                type="button"
                className="hf-contact__other-offers"
                onClick={() => setShowAllOffers((v) => !v)}
                aria-expanded={showAllOffers}
              >
                {showAllOffers ? t('intake.hide_offers') : t('intake.other_offers')}
              </button>

              {/* ── Planes adicionales (desplegable) ── */}
              <AnimatePresence>
                {showAllOffers && (
                  <motion.div
                    className="hf-contact__extra-plans"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    {/* Toggle de facturación */}
                    <div className="hf-contact__billing-toggle">
                      {BILLING_PERIODS.map((period) => (
                        <button
                          key={period}
                          type="button"
                          className={`hf-contact__billing-btn${expandedBilling === period ? ' hf-contact__billing-btn--active' : ''}`}
                          onClick={() => setExpandedBilling(period)}
                        >
                          {t(`pricing.toggle.${period}`)}
                        </button>
                      ))}
                    </div>

                    {/* Grid de tarjetas del catálogo */}
                    <div className="hf-contact__extra-plans-grid" role="radiogroup">
                      {CATALOG_PLANS.map((planBase) => {
                        const planId: SelectablePlan = `${planBase}_${expandedBilling}`;
                        const cfg = CORE_PLAN_CONFIG[planId];
                        if (!cfg) return null;
                        const price = t(`pricing.${planBase}.${expandedBilling}.price`).replace(/[€$]/g, '');
                        const oldPrice = t(`pricing.${planBase}.${expandedBilling}.old_price`);
                        const period = t(`pricing.${planBase}.${expandedBilling}.period`);
                        return (
                          <article
                            key={planId}
                            className={`hf-contact__pricing-card hf-contact__pricing-card--compact${selectedPlan === planId ? ' hf-contact__pricing-card--selected' : ' hf-contact__pricing-card--dimmed'}`}
                            role="radio"
                            aria-checked={selectedPlan === planId}
                            tabIndex={0}
                            onClick={() => setSelectedPlan(planId)}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan(planId)}
                          >
                            <h3 className="hf-contact__pricing-plan">{t(`pricing.${planBase}.name`)}</h3>
                            <div className="hf-contact__pricing-price-block">
                              {expandedBilling !== 'monthly' && (
                                <span className="hf-contact__pricing-old">{oldPrice}</span>
                              )}
                              <span className="hf-contact__pricing-amount">{price}</span>
                              <div className="hf-contact__pricing-meta">
                                <span className="hf-contact__pricing-currency">€</span>
                                <span className="hf-contact__pricing-period">{period}</span>
                              </div>
                            </div>
                            <ul className="hf-contact__pricing-features">
                              {Array.from({ length: FEAT_COUNT }, (_, i) => (
                                <li key={i}>
                                  <span className="hf-contact__pricing-check">✓</span>
                                  {t(`pricing.${planBase}.feat_${i + 1}`)}
                                </li>
                              ))}
                            </ul>
                            <span className="hf-contact__pricing-select-label">
                              {selectedPlan === planId ? t('intake.selected') : t('intake.select')}
                            </span>
                          </article>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Formulario de datos + Envío ── */}
              <form
                className={`hf-contact__form hf-contact__form--pricing${highlightForm ? ' hf-contact__form--highlight' : ''}`}
                ref={formRef}
                onSubmit={handleFinalSubmit}
              >
                {/* ── Resumen de selección ── */}
                {selectedPlan && CORE_PLAN_CONFIG[selectedPlan] && (
                  <div className="hf-contact__summary">
                    <span className="hf-contact__summary-label">{t('intake.summary.label')}</span>
                    <span className="hf-contact__summary-plan">{t(CORE_PLAN_CONFIG[selectedPlan].nameKey)}</span>
                    <span className="hf-contact__summary-price">{CORE_PLAN_CONFIG[selectedPlan].totalPrice}€</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="hf-contact__error" role="alert">
                    {t('contact.error')}
                  </div>
                )}

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
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
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
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                {/* ── Botón final de envío ── */}
                <button
                  type="submit"
                  className={`hf-contact__submit hf-contact__submit--final${isLoading ? ' hf-contact__submit--loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading
                    ? t('contact.submitting')
                    : `${t('intake.final_cta')} — ${selectedPlan && CORE_PLAN_CONFIG[selectedPlan] ? CORE_PLAN_CONFIG[selectedPlan].totalPrice : 0}€`}
                </button>
              </form>

              <p className="hf-contact__privacy">{t('contact.privacy')}</p>

              <button type="button" className="hf-contact__back hf-contact__back--top" onClick={() => goTo(1, -1)}>
                {t('intake.back')}
              </button>
            </motion.div>
          )}

          {/* ═══════ PASO 3 — Success ═══════ */}
          {step === 3 && (
            <motion.div
              key="success"
              className="hf-contact__step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <div className="hf-contact__success">
                <span className="hf-contact__success-icon">✓</span>
                <h2 className="hf-contact__success-title">{t('contact.success.title')}</h2>
                <p className="hf-contact__success-body">{t('contact.success.body')}</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
};

export default ContactForm;
