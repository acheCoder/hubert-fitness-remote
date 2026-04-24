import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import './FloatingCTA.scss';

const FloatingCTA = () => {
  const { t } = useI18n();

  return (
    <a href="/#huberfit-contact" className="floating-cta">
      <span className="floating-cta__text floating-cta__text--mobile">
        {t('floating_cta.mobile')}
      </span>
      <span className="floating-cta__text floating-cta__text--desktop">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {t('floating_cta.desktop')}
      </span>
    </a>
  );
};

export default FloatingCTA;
