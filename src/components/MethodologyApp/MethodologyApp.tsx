import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import appMockupBg from '../../assets/app-mockup.svg';
import appMobileSvg from '../../assets/app-mobile.svg';
import './MethodologyApp.scss';

const LIST_KEYS = ['methodology.list_1', 'methodology.list_2', 'methodology.list_3', 'methodology.list_4'] as const;

const MethodologyApp = () => {
  const { t } = useI18n();
  const sectionRef = useScrollReveal<HTMLElement>({ threshold: 0.15 });

  return (
    <section className="hf-method sr" id="huberfit-method" ref={sectionRef}>
      {/* Fondo: app-mockup.svg (solo desktop) */}
      <div className="hf-method__bg" style={{ backgroundImage: `url(${appMockupBg})` }} />

      <div className="hf-method__inner">
        <div className="hf-method__panel">
          <span className="hf-method__label sr sr--delay-1">{t('methodology.label')}</span>
          <h2 className="hf-method__headline sr sr--delay-2">{t('methodology.headline')}</h2>
          <p className="hf-method__body sr sr--delay-3">{t('methodology.subheadline')}</p>
          <ul className="hf-method__list sr sr--delay-4">
            {LIST_KEYS.map((key) => (
              <li key={key} className="hf-method__list-item">{t(key)}</li>
            ))}
          </ul>

          {/* Imagen mobile — dentro de la card, solo en ≤768px */}
          <img
            className="hf-method__mobile-img sr sr--delay-5"
            src={appMobileSvg}
            alt="App HubertFit"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default MethodologyApp;
