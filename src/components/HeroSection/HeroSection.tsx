import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import heroImage from '../../assets/hero.png';
import techGridBg from '../../assets/tech-grid-bg.svg';
import './HeroSection.scss';

const HeroSection = () => {
  const { t } = useI18n();
  const sectionRef = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  const scrollToContact = () => {
    document.getElementById('huberfit-contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hf-hero sr" id="huberfit-hero" ref={sectionRef}>
      {/* ── Texto (columna izquierda) ── */}
      <div className="hf-hero__text">
        <h1 className="hf-hero__headline sr sr--delay-1">
          {t('hero.headline.1')}
          <br />
          <span className="hf-hero__headline--accent">{t('hero.headline.2')}</span>
        </h1>
        <p className="hf-hero__subheadline sr sr--delay-2">{t('hero.subheadline')}</p>
        <button className="hf-hero__cta sr sr--delay-3" onClick={scrollToContact} type="button">
          {t('hero.cta')}
        </button>
      </div>

      {/* ── Imagen (columna derecha) ── */}
      <div className="hf-hero__visual sr sr--delay-2">
        <div className="hf-hero__tech-grid" style={{ backgroundImage: `url(${techGridBg})` }} />

        {/* ── Círculo gradiente — réplica fiel del hero.svg ── */}
        <svg
          className="hf-hero__circle"
          viewBox="0 0 600 600"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Capa exterior: r=290, centrado */}
            <radialGradient id="heroCircleOuter" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#09E1C0" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#09E1C0" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#09E1C0" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#09E1C0" stopOpacity="0" />
            </radialGradient>
            {/* Capa media: r≈211, descentrado */}
            <radialGradient id="heroCircleMid" cx="55%" cy="55%" r="42%">
              <stop offset="0%" stopColor="#09E1C0" stopOpacity="0.5" />
              <stop offset="35%" stopColor="#09E1C0" stopOpacity="0.3" />
              <stop offset="65%" stopColor="#09E1C0" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#09E1C0" stopOpacity="0" />
            </radialGradient>
            {/* Capa interior: r≈123, descentrado */}
            <radialGradient id="heroCircleInner" cx="45%" cy="48%" r="28%">
              <stop offset="0%" stopColor="#09E1C0" stopOpacity="0.7" />
              <stop offset="30%" stopColor="#09E1C0" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#09E1C0" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#09E1C0" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* 3 capas concéntricas como en hero.svg */}
          <circle cx="300" cy="300" r="300" fill="url(#heroCircleOuter)" />
          <circle cx="300" cy="300" r="300" fill="url(#heroCircleMid)" />
          <circle cx="300" cy="300" r="300" fill="url(#heroCircleInner)" />
        </svg>

        <div className="hf-hero__glow" />
        <img
          className="hf-hero__image"
          src={heroImage}
          alt="HubertFit— Entrenador Personal"
          loading="eager"
        />
      </div>
    </section>
  );
};

export default HeroSection;
