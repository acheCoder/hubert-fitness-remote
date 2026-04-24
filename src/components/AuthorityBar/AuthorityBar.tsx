import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './AuthorityBar.scss';

const STATS = [
  { key: 'authority.stat_1', icon: '🏆' },
  { key: 'authority.stat_2', icon: '⚡' },
  { key: 'authority.stat_3', icon: '🧬' },
] as const;

const AuthorityBar = () => {
  const { t } = useI18n();
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section className="hf-authority sr" ref={ref}>
      <div className="hf-authority__inner">
        {STATS.map(({ key, icon }) => (
          <div className="hf-authority__stat" key={key}>
            <span className="hf-authority__icon">{icon}</span>
            <span className="hf-authority__label">{t(key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AuthorityBar;
