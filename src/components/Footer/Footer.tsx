import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import './Footer.scss';

const LEGAL_LINKS = [
  { key: 'footer.legal', href: '#' },
  { key: 'footer.privacy', href: '#' },
  { key: 'footer.cookies', href: '#' },
  { key: 'footer.terms', href: '#' },
] as const;

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="hf-footer">
      <span className="hf-footer__copy">{t('footer.copy')}</span>
      <nav className="hf-footer__links">
        {LEGAL_LINKS.map(({ key, href }, i) => (
          <span key={key}>
            <a href={href} className="hf-footer__link">{t(key)}</a>
            {i < LEGAL_LINKS.length - 1 && <span className="hf-footer__sep">|</span>}
          </span>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
