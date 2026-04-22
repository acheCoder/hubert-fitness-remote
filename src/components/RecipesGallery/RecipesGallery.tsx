import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './RecipesGallery.scss';

import tataki from '../../assets/img-comidas/tataki.jpeg';
import pizza from '../../assets/img-comidas/pizza.jpg';
import tortitas from '../../assets/img-comidas/tortitas.jpeg';
import fajitas from '../../assets/img-comidas/fajitas.jpeg';
import brochetas from '../../assets/img-comidas/brochetas.jpeg';
import pulpo from '../../assets/img-comidas/pulpo.jpeg';
import donuts from '../../assets/img-comidas/donuts.jpg';
import cocido from '../../assets/img-comidas/cocido.jpeg';

const RECIPES = [
  { id: 1, src: tataki, alt: 'Tataki', name: 'Tataki de atún' },
  { id: 2, src: pizza, alt: 'Pizza', name: 'Pizza proteica' },
  { id: 3, src: tortitas, alt: 'Tortitas', name: 'Tortitas fit' },
  { id: 4, src: fajitas, alt: 'Fajitas', name: 'Fajitas de pollo' },
  { id: 5, src: brochetas, alt: 'Brochetas', name: 'Brochetas mixtas' },
  { id: 6, src: pulpo, alt: 'Pulpo', name: 'Pulpo a la gallega' },
  { id: 7, src: donuts, alt: 'Donuts', name: 'Donuts proteicos' },
  { id: 8, src: cocido, alt: 'Cocido', name: 'Cocido madrileño' },
] as const;

const RecipesGallery = () => {
  const { t } = useI18n();
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section className="hf-recipes sr" id="huberfit-recipes" ref={sectionRef}>
      {/* ── Header ── */}
      <span className="hf-recipes__label">{t('recipes.title')}</span>
      <h2 className="hf-recipes__headline">{t('recipes.headline')}</h2>
      <p className="hf-recipes__subheadline">{t('recipes.subheadline')}</p>

      {/* ── Grid ── */}
      <div className="hf-recipes__grid">
        {RECIPES.map(({ id, src, alt, name }) => (
          <div className="hf-recipes__card" key={id}>
            <img
              className="hf-recipes__img"
              src={src}
              alt={alt}
              loading="lazy"
            />
            <span className="hf-recipes__name">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecipesGallery;
