import { useState } from 'react';
import { useI18n } from '../../common-submodule/src/i18n/I18nContext';
import './MacroCalculator.scss';

type Sex = 'M' | 'F';
type Goal = 'cut' | 'bulk';

interface ActivityLevel {
  key: string;
  factor: number;
}

const ACTIVITY_LEVELS: ActivityLevel[] = [
  { key: 'macro.activity_1', factor: 1.2 },
  { key: 'macro.activity_2', factor: 1.375 },
  { key: 'macro.activity_3', factor: 1.55 },
  { key: 'macro.activity_4', factor: 1.725 },
  { key: 'macro.activity_5', factor: 1.9 },
];

/** Ajuste calórico y reparto macro según objetivo */
const GOAL_CONFIG: Record<Goal, { offset: number; protein: number; carbs: number; fat: number }> = {
  cut:  { offset: -400, protein: 0.35, carbs: 0.35, fat: 0.30 },
  bulk: { offset:  300, protein: 0.30, carbs: 0.45, fat: 0.25 },
};

interface Results {
  tdee: number;
  adjusted: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: Goal;
}

const MacroCalculator = () => {
  const { t } = useI18n();

  const [sex, setSex] = useState<Sex>('M');
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(28);
  const [activityIdx, setActivityIdx] = useState(2);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [results, setResults] = useState<Results | null>(null);

  const handleCalculate = () => {
    if (goal === null) return;

    /* Mifflin-St Jeor */
    const bmr =
      sex === 'M'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = Math.round(bmr * ACTIVITY_LEVELS[activityIdx].factor);
    const cfg = GOAL_CONFIG[goal];
    const adjusted = Math.round(tdee + cfg.offset);

    setResults({
      tdee,
      adjusted,
      protein: Math.round((adjusted * cfg.protein) / 4),
      carbs:   Math.round((adjusted * cfg.carbs) / 4),
      fat:     Math.round((adjusted * cfg.fat) / 9),
      goal,
    });
  };

  return (
    <div className="macro-calc">
      <h2 className="macro-calc__heading">{t('macro.title')}</h2>

      {/* Sexo */}
      <div className="macro-calc__group">
        <span className="macro-calc__label">{t('macro.sex')}</span>
        <div className="macro-calc__tabs">
          <button
            type="button"
            className={`macro-calc__tab${sex === 'M' ? ' macro-calc__tab--active' : ''}`}
            onClick={() => setSex('M')}
          >
            {t('macro.male')}
          </button>
          <button
            type="button"
            className={`macro-calc__tab${sex === 'F' ? ' macro-calc__tab--active' : ''}`}
            onClick={() => setSex('F')}
          >
            {t('macro.female')}
          </button>
        </div>
      </div>

      {/* Peso */}
      <div className="macro-calc__group">
        <label className="macro-calc__label">
          {t('macro.weight')} <strong>{weight} kg</strong>
        </label>
        <input
          type="range"
          min={40}
          max={160}
          value={weight}
          onChange={(e) => setWeight(+e.target.value)}
          className="macro-calc__slider"
        />
      </div>

      {/* Altura */}
      <div className="macro-calc__group">
        <label className="macro-calc__label">
          {t('macro.height')} <strong>{height} cm</strong>
        </label>
        <input
          type="range"
          min={140}
          max={220}
          value={height}
          onChange={(e) => setHeight(+e.target.value)}
          className="macro-calc__slider"
        />
      </div>

      {/* Edad */}
      <div className="macro-calc__group">
        <label className="macro-calc__label">
          {t('macro.age')} <strong>{age}</strong>
        </label>
        <input
          type="range"
          min={14}
          max={80}
          value={age}
          onChange={(e) => setAge(+e.target.value)}
          className="macro-calc__slider"
        />
      </div>

      {/* Nivel de actividad */}
      <div className="macro-calc__group">
        <span className="macro-calc__label">{t('macro.activity')}</span>
        <div className="macro-calc__activity-grid">
          {ACTIVITY_LEVELS.map((lvl, i) => (
            <button
              key={lvl.key}
              type="button"
              className={`macro-calc__activity-btn${i === activityIdx ? ' macro-calc__activity-btn--active' : ''}`}
              onClick={() => setActivityIdx(i)}
            >
              {t(lvl.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Objetivo */}
      <div className="macro-calc__group">
        <span className="macro-calc__label">{t('macro.goal')}</span>
        <div className="macro-calc__tabs">
          <button
            type="button"
            className={`macro-calc__tab macro-calc__tab--goal${goal === 'cut' ? ' macro-calc__tab--active' : ''}`}
            onClick={() => setGoal('cut')}
          >
            🔥 {t('macro.goal_cut')}
          </button>
          <button
            type="button"
            className={`macro-calc__tab macro-calc__tab--goal${goal === 'bulk' ? ' macro-calc__tab--active' : ''}`}
            onClick={() => setGoal('bulk')}
          >
            💪 {t('macro.goal_bulk')}
          </button>
        </div>
      </div>

      {/* Botón CALCULAR */}
      <button
        type="button"
        className={`macro-calc__calculate${goal === null ? ' macro-calc__calculate--disabled' : ''}`}
        disabled={goal === null}
        onClick={handleCalculate}
      >
        {t('macro.calculate')}
      </button>

      {/* Resultados — solo visibles tras CALCULAR */}
      {results && (
        <div className="macro-calc__results macro-calc__results--visible" key={`${results.adjusted}-${results.goal}`}>
          <p className="macro-calc__goal-label">
            {results.goal === 'cut' ? `🔥 ${t('macro.goal_cut')}` : `💪 ${t('macro.goal_bulk')}`}
          </p>

          <div className="macro-calc__kcal">
            <span className="macro-calc__kcal-value">{results.adjusted}</span>
            <span className="macro-calc__kcal-unit">kcal / {t('macro.day')}</span>
            <span className="macro-calc__kcal-detail">
              TDEE: {results.tdee} kcal ({results.goal === 'cut' ? '−400' : '+300'})
            </span>
          </div>

          <div className="macro-calc__macros">
            <div className="macro-calc__pill macro-calc__pill--protein">
              <span className="macro-calc__pill-value">{results.protein}g</span>
              <span className="macro-calc__pill-label">{t('macro.protein')}</span>
            </div>
            <div className="macro-calc__pill macro-calc__pill--carbs">
              <span className="macro-calc__pill-value">{results.carbs}g</span>
              <span className="macro-calc__pill-label">{t('macro.carbs')}</span>
            </div>
            <div className="macro-calc__pill macro-calc__pill--fat">
              <span className="macro-calc__pill-value">{results.fat}g</span>
              <span className="macro-calc__pill-label">{t('macro.fat')}</span>
            </div>
          </div>

          <a href="/#huberfit-contact" className="macro-calc__cta">
            {t('macro.cta')}
          </a>
        </div>
      )}
    </div>
  );
};

export default MacroCalculator;
