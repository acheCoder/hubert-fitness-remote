import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './QualificationFunnel.scss';

/* ── Tipos ── */
type Objective = 'fat_loss' | 'muscle_gain' | 'health' | null;
type TrainingDays = '1-2' | '3-4' | '5-6' | null;
type Timeframe = '2_weeks' | '3_months' | '6_months' | null;
type FunnelScreen = 'step1' | 'step2' | 'step3' | 'rejected' | 'approved';

const BILLING_OPTIONS = ['quarterly', 'semiannual'] as const;
type BillingPeriod = (typeof BILLING_OPTIONS)[number];
const FEAT_COUNT = 4;

/* ── Variantes de animación ── */
const slideVariants = {
  enter: (dir: 1 | -1) => ({ x: dir * 50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 1 | -1) => ({ x: dir * -50, opacity: 0 }),
};

const transition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

const QualificationFunnel = () => {
  const { t } = useI18n();
  const sectionRef = useScrollReveal<HTMLElement>();

  /* ── Estado del funnel ── */
  const [screen, setScreen] = useState<FunnelScreen>('step1');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [objective, setObjective] = useState<Objective>(null);
  const [trainingDays, setTrainingDays] = useState<TrainingDays>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>(null);
  const [billing, setBilling] = useState<BillingPeriod>('quarterly');

  const goTo = useCallback((next: FunnelScreen, dir: 1 | -1 = 1) => {
    setDirection(dir);
    setScreen(next);
  }, []);

  /* ── Motor de decisión ── */
  const evaluate = useCallback(() => {
    if (trainingDays === '1-2' || timeframe === '2_weeks') {
      goTo('rejected');
    } else {
      goTo('approved');
    }
  }, [trainingDays, timeframe, goTo]);

  /* ── Scroll al contacto con plan preseleccionado ── */
  const selectPlan = useCallback(() => {
    window.dispatchEvent(new CustomEvent('select-plan', { detail: `complete_${billing}` }));
    document.getElementById('huberfit-contact')?.scrollIntoView({ behavior: 'smooth' });
  }, [billing]);

  /* ── Indicador de progreso ── */
  const stepIndex = screen === 'step1' ? 0 : screen === 'step2' ? 1 : screen === 'step3' ? 2 : -1;

  return (
    <section className="hf-funnel sr" id="huberfit-pricing" ref={sectionRef}>
      <span className="hf-funnel__label">{t('funnel.label')}</span>
      <h2 className="hf-funnel__headline">{t('funnel.headline')}</h2>
      <p className="hf-funnel__subheadline">{t('funnel.subheadline')}</p>

      {/* ── Progress bar (solo en pasos 1-3) ── */}
      {stepIndex >= 0 && (
        <div className="hf-funnel__progress">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`hf-funnel__progress-dot${i <= stepIndex ? ' hf-funnel__progress-dot--active' : ''}`}
            />
          ))}
        </div>
      )}

      {/* ── Contenedor animado ── */}
      <div className="hf-funnel__container">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ════════ PASO 1 — Objetivo ════════ */}
          {screen === 'step1' && (
            <motion.div
              key="step1"
              className="hf-funnel__step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <h3 className="hf-funnel__question">{t('funnel.step1.question')}</h3>
              <div className="hf-funnel__options">
                {(['fat_loss', 'muscle_gain', 'health'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`hf-funnel__option${objective === opt ? ' hf-funnel__option--selected' : ''}`}
                    onClick={() => setObjective(opt)}
                  >
                    <span className="hf-funnel__option-icon">{t(`funnel.step1.${opt}.icon`)}</span>
                    <span className="hf-funnel__option-label">{t(`funnel.step1.${opt}`)}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={`hf-funnel__next${!objective ? ' hf-funnel__next--disabled' : ''}`}
                disabled={!objective}
                onClick={() => goTo('step2')}
              >
                {t('funnel.next')}
              </button>
            </motion.div>
          )}

          {/* ════════ PASO 2 — Días de entrenamiento ════════ */}
          {screen === 'step2' && (
            <motion.div
              key="step2"
              className="hf-funnel__step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <h3 className="hf-funnel__question">{t('funnel.step2.question')}</h3>
              <div className="hf-funnel__options">
                {(['1-2', '3-4', '5-6'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`hf-funnel__option${trainingDays === opt ? ' hf-funnel__option--selected' : ''}`}
                    onClick={() => setTrainingDays(opt)}
                  >
                    <span className="hf-funnel__option-icon">{t(`funnel.step2.${opt}.icon`)}</span>
                    <span className="hf-funnel__option-label">{t(`funnel.step2.${opt}`)}</span>
                  </button>
                ))}
              </div>
              <div className="hf-funnel__nav">
                <button type="button" className="hf-funnel__back" onClick={() => goTo('step1', -1)}>
                  {t('funnel.back')}
                </button>
                <button
                  type="button"
                  className={`hf-funnel__next${!trainingDays ? ' hf-funnel__next--disabled' : ''}`}
                  disabled={!trainingDays}
                  onClick={() => goTo('step3')}
                >
                  {t('funnel.next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════ PASO 3 — Expectativas de tiempo ════════ */}
          {screen === 'step3' && (
            <motion.div
              key="step3"
              className="hf-funnel__step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <h3 className="hf-funnel__question">{t('funnel.step3.question')}</h3>
              <div className="hf-funnel__options">
                {(['2_weeks', '3_months', '6_months'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`hf-funnel__option${timeframe === opt ? ' hf-funnel__option--selected' : ''}`}
                    onClick={() => setTimeframe(opt)}
                  >
                    <span className="hf-funnel__option-icon">{t(`funnel.step3.${opt}.icon`)}</span>
                    <span className="hf-funnel__option-label">{t(`funnel.step3.${opt}`)}</span>
                  </button>
                ))}
              </div>
              <div className="hf-funnel__nav">
                <button type="button" className="hf-funnel__back" onClick={() => goTo('step2', -1)}>
                  {t('funnel.back')}
                </button>
                <button
                  type="button"
                  className={`hf-funnel__next${!timeframe ? ' hf-funnel__next--disabled' : ''}`}
                  disabled={!timeframe}
                  onClick={evaluate}
                >
                  {t('funnel.evaluate')}
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════ PANTALLA DE RECHAZO ════════ */}
          {screen === 'rejected' && (
            <motion.div
              key="rejected"
              className="hf-funnel__step hf-funnel__step--result"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <div className="hf-funnel__result hf-funnel__result--rejected">
                <span className="hf-funnel__result-icon">✗</span>
                <h3 className="hf-funnel__result-title">{t('funnel.rejected.title')}</h3>
                <p className="hf-funnel__result-body">{t('funnel.rejected.body')}</p>
                <button
                  type="button"
                  className="hf-funnel__restart"
                  onClick={() => {
                    setObjective(null);
                    setTrainingDays(null);
                    setTimeframe(null);
                    goTo('step1', -1);
                  }}
                >
                  {t('funnel.rejected.retry')}
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════ PANTALLA DE APTO ════════ */}
          {screen === 'approved' && (
            <motion.div
              key="approved"
              className="hf-funnel__step hf-funnel__step--result"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <div className="hf-funnel__result hf-funnel__result--approved">
                <span className="hf-funnel__result-icon">✓</span>
                <h3 className="hf-funnel__result-title">{t('funnel.approved.title')}</h3>
                <p className="hf-funnel__result-body">{t('funnel.approved.body')}</p>

                {/* ── Plan recomendado: COMPLETO ── */}
                <div className="hf-funnel__plan">
                  <span className="hf-funnel__plan-badge">{t('pricing.recommended')}</span>
                  <h4 className="hf-funnel__plan-name">{t('pricing.complete.name')}</h4>

                  {/* Toggle trimestral / semestral */}
                  <div className="hf-funnel__billing-toggle">
                    {BILLING_OPTIONS.map((period) => (
                      <button
                        key={period}
                        type="button"
                        className={`hf-funnel__billing-btn${billing === period ? ' hf-funnel__billing-btn--active' : ''}`}
                        onClick={() => setBilling(period)}
                      >
                        {t(`pricing.toggle.${period}`)}
                      </button>
                    ))}
                  </div>

                  {/* Precio */}
                  <div className="hf-funnel__plan-price">
                    <span className="hf-funnel__plan-old">
                      {t(`pricing.complete.${billing}.old_price`)}
                    </span>
                    <span className="hf-funnel__plan-amount" key={billing}>
                      {t(`pricing.complete.${billing}.price`).replace(/[€$]/g, '')}
                      <span className="hf-funnel__plan-currency">€</span>
                    </span>
                    <span className="hf-funnel__plan-period">
                      {t(`pricing.complete.${billing}.period`)}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="hf-funnel__plan-features">
                    {Array.from({ length: FEAT_COUNT }, (_, j) => (
                      <li key={j}>
                        <span className="hf-funnel__plan-check">✓</span>
                        {t(`pricing.complete.feat_${j + 1}`)}
                      </li>
                    ))}
                  </ul>

                  <button type="button" className="hf-funnel__plan-cta" onClick={selectPlan}>
                    {t('funnel.approved.cta')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default QualificationFunnel;
