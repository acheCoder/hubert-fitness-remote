import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import predicaBg from '../../assets/predica.svg';
import predicaMobile from '../../assets/predicando_mobile.svg';
import './AboutMe.scss';

const AboutMe = () => {
  const { t } = useI18n();
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section className="hf-aboutme sr" id="huberfit-aboutme" ref={sectionRef}>
      {/* Fondo: predica.svg a pantalla completa (solo desktop) */}
      <div
        className="hf-aboutme__bg"
        style={{ backgroundImage: `url(${predicaBg})` }}
      />

      {/* Contenedor interno */}
      <div className="hf-aboutme__inner">
        <div className="hf-aboutme__panel">
          <span className="hf-aboutme__label sr sr--delay-1">{t('aboutme.title')}</span>
          <h2 className="hf-aboutme__headline sr sr--delay-2">{t('aboutme.headline')}</h2>
          <p className="hf-aboutme__body sr sr--delay-3">{t('aboutme.subheadline')}</p>

          {/* Imagen mobile — visible solo en ≤768px */}
          <img
            className="hf-aboutme__mobile-img sr sr--delay-4"
            src={predicaMobile}
            alt="Hubert — Entrenador Personal"
            loading="lazy"
          />

          <a href="#huberfit-contact" className="hf-aboutme__cta sr sr--delay-5">
            {t('aboutme.cta')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
