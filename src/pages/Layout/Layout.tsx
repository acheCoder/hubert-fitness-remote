import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import Navbar from '../../common-submodule/src/components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import FloatingCTA from '../../components/FloatingCTA/FloatingCTA';
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';
import { huberfitTranslations } from '../../locales';
import logoImg from '../../assets/logo.png';

import '../Huberfit/HuberfitApp.scss';

const Layout = () => {
  const { t, lang, setLang, registerTranslations } = useI18n();
  const registered = useRef<boolean | null>(null);
  const { pathname } = useLocation();

  if (registered.current == null) {
    registerTranslations(huberfitTranslations);
    registered.current = true;
  }

  /* Escuchar evento del Navbar para cambiar idioma */
  useEffect(() => {
    const handleLangEvent = (e: Event) => {
      const newLang = (e as CustomEvent).detail;
      if (newLang === 'es' || newLang === 'en') setLang(newLang);
    };
    window.addEventListener('change-language', handleLangEvent);
    return () => window.removeEventListener('change-language', handleLangEvent);
  }, [setLang]);

  /* Scroll al tope cuando cambia la ruta */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.calculator'), href: '/calculadora' },
    { label: t('nav.pricing'), href: '/#huberfit-pricing' },
    { label: t('nav.contact'), href: '/#huberfit-contact' },
  ];

  /* Scroll al tope al hacer clic en el link "Inicio" (delegación de eventos) */
  useEffect(() => {
    const handleNavClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a.nav-item[href="/"]');
      if (!anchor) return;
      if (pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    document.addEventListener('click', handleNavClick);
    return () => document.removeEventListener('click', handleNavClick);
  }, [pathname]);

  return (
    <div className="huberfit">
      <Navbar
        links={navLinks}
        lang={lang}
        logoSrc={logoImg}
        ctaLabel={t('nav.cta')}
        ctaHref="/#huberfit-contact"
      />

      <div className="huberfit__content">
        <Outlet />
      </div>

      <FloatingCTA />
      <ScrollToTop />
      <Footer />
    </div>
  );
};

export default Layout;
