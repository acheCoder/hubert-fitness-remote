import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import MacroCalculator from '../../components/MacroCalculator/MacroCalculator';
import './CalculadoraPage.scss';

const CalculadoraPage = () => {
  const { t } = useI18n();

  return (
    <section className="calc-page">
      <div className="calc-page__hero">
        <h1 className="calc-page__title">{t('calc_page.title')}</h1>
        <p className="calc-page__subtitle">{t('calc_page.subtitle')}</p>
      </div>
      <MacroCalculator />
    </section>
  );
};

export default CalculadoraPage;
