import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import cambio1 from '../../assets/img-cambios/cambio1.jpg';
import cambio2 from '../../assets/img-cambios/cambio2.jpg';
import cambio3 from '../../assets/img-cambios/cambio3.jpg';
import cambio4 from '../../assets/img-cambios/cambio4.jpg';
import cambio5 from '../../assets/img-cambios/cambio5.png';
import cambio6 from '../../assets/img-cambios/cambio6.png';
import cambio7 from '../../assets/img-cambios/cambio7.png';
import cambio8 from '../../assets/img-cambios/cambio8.png';
import cambio9 from '../../assets/img-cambios/cambio9.jpg';
import cambio10 from '../../assets/img-cambios/cambio10.jpg';
import './Transformations.scss';

/* ─── Data estática (las imágenes no cambian con el idioma) ─── */
const CLIENT_IMAGES = [
  { before: cambio1, after: cambio2 },
  { before: cambio3, after: cambio4 },
  { before: cambio5, after: cambio6 },
  { before: cambio7, after: cambio8 },
  { before: cambio9, after: cambio10 },
];

const CLIENT_COUNT = CLIENT_IMAGES.length;

const REVIEW_MAX_LENGTH = 200;
const AUTO_SCROLL_INTERVAL = 4000; // ms entre cada avance

const Transformations = () => {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const headerRef = useScrollReveal<HTMLElement>();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollOne = useCallback((dir: 1 | -1) => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector<HTMLElement>('.hf-tf__card');
    const distance = card ? card.offsetWidth + 32 : 380;
    trackRef.current.scrollBy({ left: dir * distance, behavior: 'smooth' });
  }, []);

  const scrollNext = useCallback(() => {
    if (!trackRef.current || pausedRef.current) return;
    const el = trackRef.current;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
    if (atEnd) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      scrollOne(1);
    }
  }, [scrollOne]);

  /* Auto-scroll */
  useEffect(() => {
    timerRef.current = setInterval(scrollNext, AUTO_SCROLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [scrollNext]);

  /* Volver al inicio cuando el usuario llega al final manualmente */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (resetTimer) clearTimeout(resetTimer);
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      if (atEnd) {
        resetTimer = setTimeout(() => {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        }, 1500);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  /* Pausar al interactuar */
  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  return (
    <section className="hf-tf sr" id="huberfit-results" ref={headerRef}>
      {/* ── Header ── */}
      <span className="hf-tf__label">{t('transformations.title')}</span>
      <h2 className="hf-tf__headline">{t('transformations.headline')}</h2>
      <p className="hf-tf__subheadline">{t('transformations.subheadline')}</p>

      {/* ── Carousel wrapper ── */}
      <div
        className="hf-tf__carousel"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
      >
        <button
          className="hf-tf__arrow hf-tf__arrow--left"
          onClick={() => scrollOne(-1)}
          aria-label="Previous"
          type="button"
        >
          ‹
        </button>

        <div className="hf-tf__track" ref={trackRef}>
          {Array.from({ length: CLIENT_COUNT }, (_, i) => {
            const idx = i + 1;
            const imgs = CLIENT_IMAGES[i];
            return (
              <article className="hf-tf__card" key={idx}>
                {/* ── Before / After ── */}
                <div className="hf-tf__images">
                  <div className="hf-tf__img-wrapper">
                    <img src={imgs.before} alt={`${t(`transformations.client_${idx}.name`)} ${t('transformations.before')}`} loading="lazy" />
                    <span className="hf-tf__img-tag">{t('transformations.before')}</span>
                  </div>
                  <div className="hf-tf__img-wrapper">
                    <img src={imgs.after} alt={`${t(`transformations.client_${idx}.name`)} ${t('transformations.after')}`} loading="lazy" />
                    <span className="hf-tf__img-tag hf-tf__img-tag--after">{t('transformations.after')}</span>
                  </div>
                </div>

                {/* ── Metric ── */}
                <span className="hf-tf__metric">{t(`transformations.client_${idx}.metric`)}</span>

                {/* ── Name + Review ── */}
                <span className="hf-tf__name">{t(`transformations.client_${idx}.name`)}</span>
                {(() => {
                  const review = t(`transformations.client_${idx}.review`);
                  const isLong = review.length > REVIEW_MAX_LENGTH;
                  const isExpanded = expanded[idx];
                  return (
                    <div className="hf-tf__review-wrapper">
                      <blockquote className={`hf-tf__review${isLong && !isExpanded ? ' hf-tf__review--clamped' : ''}`}>
                        {review}
                      </blockquote>
                      {isLong && (
                        <button
                          className="hf-tf__read-more"
                          type="button"
                          onClick={() => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        >
                          {isExpanded ? (t('transformations.read_less') !== 'transformations.read_less' ? t('transformations.read_less') : 'Leer menos') : (t('transformations.read_more') !== 'transformations.read_more' ? t('transformations.read_more') : 'Leer más')}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </article>
            );
          })}
        </div>

        <button
          className="hf-tf__arrow hf-tf__arrow--right"
          onClick={() => scrollOne(1)}
          aria-label="Next"
          type="button"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default Transformations;
