import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './PricingSection.scss';

const PLANS = ['nutrition', 'complete', 'training'] as const;
const BILLING_PERIODS = ['monthly', 'quarterly', 'semiannual'] as const;
type BillingPeriod = (typeof BILLING_PERIODS)[number];
const FEAT_COUNT = 4;

const PricingSection = () => {
  const { t } = useI18n();
  const sectionRef = useScrollReveal<HTMLElement>();
  const gridRef = useRef<HTMLDivElement>(null);
  const [billing, setBilling] = useState<BillingPeriod>('quarterly');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    if (!mq.matches || !gridRef.current) return;
    const featured = gridRef.current.querySelector('.hf-pricing__card--featured');
    if (featured) {
      requestAnimationFrame(() => {
        featured.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      });
    }
  }, []);

  const scrollToContact = (plan: string) => {
    window.dispatchEvent(new CustomEvent('select-plan', { detail: `${plan}_${billing}` }));
    document.getElementById('huberfit-contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hf-pricing sr" id="huberfit-pricing" ref={sectionRef}>
      {/* ── Header ── */}
      <span className="hf-pricing__label">{t('pricing.title')}</span>
      <h2 className="hf-pricing__headline">{t('pricing.headline')}</h2>

      {/* ── Bloque de autoridad ── */}
      <p className="hf-pricing__why">{t('pricing.why_me')}</p>

      {/* ── Toggle de facturación ── */}
      <div className="hf-pricing__toggle">
        {BILLING_PERIODS.map((period) => (
          <button
            key={period}
            type="button"
            className={`hf-pricing__toggle-btn${billing === period ? ' hf-pricing__toggle-btn--active' : ''}`}
            onClick={() => setBilling(period)}
          >
            {t(`pricing.toggle.${period}`)}
          </button>
        ))}
      </div>

      {/* ── Swipe hint (solo móvil) ── */}
      <p className="hf-pricing__swipe-hint">← {t('pricing.swipe_hint') ?? 'Desliza para ver m\u00e1s planes'} →</p>

      {/* ── Urgencia ── */}
      <span className="hf-pricing__urgency">{t('pricing.urgency_tag')}</span>

      {/* ── Escasez ── */}
      <p className="hf-pricing__scarcity">{t('pricing.scarcity')}</p>

      {/* ── Grid de tarjetas ── */}
      <div className="hf-pricing__grid" ref={gridRef}>
        {PLANS.map((plan) => {
          const isComplete = plan === 'complete';
          return (
            <article
              className={`hf-pricing__card${isComplete ? ' hf-pricing__card--featured' : ''}`}
              key={plan}
            >
              {isComplete && (
                <span className="hf-pricing__badge">{t('pricing.recommended')}</span>
              )}
              {plan === 'complete' && billing !== 'monthly' && (
                <span className="hf-pricing__badge hf-pricing__badge--value">{t('pricing.best_value')}</span>
              )}

              <h3 className="hf-pricing__plan-name">{t(`pricing.${plan}.name`)}</h3>

              {/* ── Precio dinámico ── */}
              <div className="hf-pricing__price-block">
                <span className="hf-pricing__old-price">
                  {t(`pricing.${plan}.${billing}.old_price`)}
                </span>
                <span className="hf-pricing__price hf-pricing__price--animate" key={billing}>
                  {t(`pricing.${plan}.${billing}.price`).replace(/[€$]/g, '')}
                  <span className="hf-pricing__currency">€</span>
                </span>
                <span className="hf-pricing__period">
                  {t(`pricing.${plan}.${billing}.period`)}
                </span>
              </div>

              {/* ── Features ── */}
              <ul className="hf-pricing__features">
                {Array.from({ length: FEAT_COUNT }, (_, j) => (
                  <li key={j}>
                    <span className="hf-pricing__check">✓</span>
                    {t(`pricing.${plan}.feat_${j + 1}`)}
                  </li>
                ))}
              </ul>

              {/* ── CTA ── */}
              <button
                className="hf-pricing__cta"
                onClick={() => scrollToContact(plan)}
                type="button"
              >
                {t('pricing.cta')}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default PricingSection;
