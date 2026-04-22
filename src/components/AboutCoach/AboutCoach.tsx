import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import contactoImg from '../../assets/contacto.png';
import './AboutCoach.scss';

const BULLET_COUNT = 4;

const AboutCoach = () => {
  const { t } = useI18n();
  const textRef = useScrollReveal();

  const scrollToContact = () => {
    document.getElementById('huberfit-contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hf-coach" id="huberfit-coach">
      <div className="hf-coach__content">
        {/* ── Imagen + badge flotante ── */}
        <div className="hf-coach__image-wrapper">
          <div className="hf-coach__image">
            <img src={contactoImg} alt={t('coach.subtitle')} loading="lazy" />
          </div>
          <div className="hf-coach__badge">
            <span className="hf-coach__badge-dot" />
            {t('coach.badge')}
          </div>
        </div>

        {/* ── Texto ── */}
        <div className="hf-coach__text sr" ref={textRef}>
          <h2 className="hf-coach__title">
            {t('coach.title')}
            <span className="hf-coach__title-accent">{t('coach.title_accent')}</span>
          </h2>
          <h3 className="hf-coach__subtitle">{t('coach.subtitle')}</h3>

          <ul className="hf-coach__bullets">
            {Array.from({ length: BULLET_COUNT }, (_, i) => (
              <li key={i}>
                <span className="hf-coach__check">✓</span>
                {t(`coach.bullet_${i + 1}`)}
              </li>
            ))}
          </ul>

          <button className="hf-coach__cta" onClick={scrollToContact} type="button">
            <span>{t('coach.cta')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutCoach;
