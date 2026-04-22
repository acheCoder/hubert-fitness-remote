import { useEffect, useRef } from 'react';
import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import Navbar from '../../common-submodule/src/components/Navbar/Navbar';
import { huberfitTranslations } from '../../locales';

import HeroSection from '../../components/HeroSection/HeroSection';
import AboutMe from '../../components/AboutMe/AboutMe';
import MethodologyApp from '../../components/MethodologyApp/MethodologyApp';
import RecipesGallery from '../../components/RecipesGallery/RecipesGallery';
import Transformations from '../../components/Transformations/Transformations';
import AboutCoach from '../../components/AboutCoach/AboutCoach';
import PricingSection from '../../components/PricingSection/PricingSection';
import ContactForm from '../../components/ContactForm/ContactForm';
import Footer from '../../components/Footer/Footer';
import logoImg from '../../assets/logo.png';

import './HuberfitApp.scss';

/**
 * HuberfitApp — Orquestador de la Landing Page de venta.
 * Funnel: Problema → Solución/App → Prueba Social → Autoridad → Conversión
 *
 * Registra TODAS las traducciones de Huberfit en un solo punto.
 */
const HuberfitApp = () => {
  const { t, lang, setLang, registerTranslations } = useI18n();
  const registered = useRef<boolean | null>(null);

  // Registrar traducciones una sola vez en el primer render
  if (registered.current == null) {
    registerTranslations(huberfitTranslations);
    registered.current = true;
  }

  /* Escuchar el evento del Navbar para cambiar idioma */
  useEffect(() => {
    const handleLangEvent = (e: Event) => {
      const newLang = (e as CustomEvent).detail;
      if (newLang === 'es' || newLang === 'en') {
        setLang(newLang);
      }
    };
    window.addEventListener('change-language', handleLangEvent);
    return () => window.removeEventListener('change-language', handleLangEvent);
  }, [setLang]);

  const navLinks = [
    { label: t('nav.method'), href: '#huberfit-method' },
    { label: t('nav.results'), href: '#huberfit-results' },
    { label: t('nav.coach'), href: '#huberfit-coach' },
    { label: t('nav.contact'), href: '#huberfit-contact' },
  ];

  return (
    <div className="huberfit">
      <Navbar links={navLinks} lang={lang} logoSrc={logoImg} />

      {/* 1. PROBLEMA — Titular agresivo + CTA */}
      <HeroSection />

      {/* 1.5. AUTORIDAD — Quién soy */}
      <AboutMe />

      {/* 2. SOLUCIÓN — Beneficios de la App (Dietas + Entrenos) */}
      <MethodologyApp />

      {/* 2.5. RECETAS — Galería de nutrición */}
      <RecipesGallery />

      {/* 3. PRUEBA SOCIAL — Testimonios y transformaciones */}
      <Transformations />

      {/* 4. AUTORIDAD — Sobre el coach */}
      <AboutCoach />

      {/* 5. PRECIOS — Planes de transformación */}
      <PricingSection />

      {/* 6. CONVERSIÓN — Formulario de captación */}
      <ContactForm />

      {/* 7. FOOTER */}
      <Footer />
    </div>
  );
};

export default HuberfitApp;
