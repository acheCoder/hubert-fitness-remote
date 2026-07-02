import { useState } from 'react';
import { Activity, ShieldCheck, Sparkles, MapPin, Laptop } from 'lucide-react';
import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './AdditionalServices.scss';

const CONTACT_EMAIL = 'diegobragado98@gmail.com';

const benefits = [
  { icon: Activity, key: 'services.physio.benefit_1' },
  { icon: ShieldCheck, key: 'services.physio.benefit_2' },
  { icon: Sparkles, key: 'services.physio.benefit_3' },
] as const;

type ServiceMode = 'presencial' | 'online';

const AdditionalServices = () => {
  const { t } = useI18n();
  const sectionRef = useScrollReveal<HTMLElement>();
  const [activeMode, setActiveMode] = useState<ServiceMode>('presencial');

  // Cambiar dinámicamente el asunto y cuerpo según el tipo de servicio seleccionado
  const emailSubject = activeMode === 'presencial' 
    ? 'Reserva Cita Fisioterapia Presencial - Madrid' 
    : 'Reserva Consulta Fisioterapia Online';
    
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
    `Hola Diego,\n\nMe gustaría reservar una sesión de fisioterapia en modalidad ${activeMode.toUpperCase()}.\n\nUn saludo.`
  )}`;

  return (
    <section className="hf-additional-services sr" id="huberfit-services" ref={sectionRef}>
      <div className="hf-additional-services__inner">
        <span className="hf-additional-services__label">{t('services.label')}</span>
        <h2 className="hf-additional-services__title">{t('services.title')}</h2>

        <div className="hf-additional-services__card">
          <div className="hf-additional-services__media">
            <img src="/images/fisioterapia.jpeg" alt={t('services.physio.image_alt')} />
          </div>

          <div className="hf-additional-services__content">
            <h3 className="hf-additional-services__heading">{t('services.physio.headline')}</h3>
            <p className="hf-additional-services__description">{t('services.physio.subheadline')}</p>

            <ul className="hf-additional-services__benefits">
              {benefits.map(({ icon: Icon, key }) => (
                <li key={key} className="hf-additional-services__benefit-item">
                  <span className="hf-additional-services__benefit-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>

            {/* Selector de Modalidad (Tabs de UI Limpias) */}
            <div className="hf-additional-services__modes">
              <button
                type="button"
                className={`hf-additional-services__mode-btn ${activeMode === 'presencial' ? 'is-active' : ''}`}
                onClick={() => setActiveMode('presencial')}
              >
                <MapPin size={16} />
                {t('services.physio.mode.presencial')}
              </button>
              <button
                type="button"
                className={`hf-additional-services__mode-btn ${activeMode === 'online' ? 'is-active' : ''}`}
                onClick={() => setActiveMode('online')}
              >
                <Laptop size={16} />
                {t('services.physio.mode.online')}
              </button>
            </div>

            {/* Panel de Precios Dinámico */}
            <div className="hf-additional-services__pricing">
              <div className="hf-additional-services__price-row">
                <span className="hf-additional-services__price-label">{t('services.physio.price.single')}</span>
                <span className="hf-additional-services__price-value">
                  {activeMode === 'presencial' ? '60€' : '45€'}
                </span>
              </div>
              <div className="hf-additional-services__price-row">
                <span className="hf-additional-services__price-label">{t('services.physio.price.bundle')}</span>
                <span className="hf-additional-services__price-value">
                  {activeMode === 'presencial' ? '250€' : '180€'}
                </span>
              </div>

              {/* Información de localización y recargo de transporte por contexto */}
              <p className="hf-additional-services__pricing-notice">
                {activeMode === 'presencial' 
                  ? t('services.physio.notice.presencial')
                  : t('services.physio.notice.online')
                }
              </p>
            </div>

            <a className="hf-additional-services__cta" href={mailtoHref}>
              {t('services.physio.cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdditionalServices;