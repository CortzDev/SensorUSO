import React, { useMemo } from 'react';
import { sensorConfig, defaultConfig } from '../utils/sensorConfig';

function useAnimatedNumber(value, duration = 600) {
  const [animated, setAnimated] = React.useState(value);
  const frame = React.useRef(null);
  const startRef = React.useRef(0);
  const fromRef = React.useRef(value);

  React.useEffect(() => {
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    startRef.current = start;
    fromRef.current = animated;

    const tick = (t) => {
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(fromRef.current + (value - fromRef.current) * eased);
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return animated;
}

function Sparkline({ points = [] }) {
  const path = useMemo(() => {
    if (!points.length) return '';
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    const w = 100, h = 28, step = w / Math.max(1, points.length - 1);
    return points
      .map((v, i) => {
        const x = i * step;
        const y = h - ((v - min) / span) * h;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [points]);

  if (!points.length) return null;
  const rising = points[points.length - 1] >= points[0];
  return (
    <svg className={`sparkline ${rising ? 'up' : 'down'}`} viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden>
      <path d={path} fill="none" strokeWidth="2" />
    </svg>
  );
}

export default function MetricCard({ sensor, index, history = [], onClick }) {
  const config = sensorConfig[sensor.code] || defaultConfig;

  let displayValue = sensor.value;
  let valueColor = 'var(--text-strong)';
  let progressBar = null;
  let description = config.getDescription ? config.getDescription(sensor.value) : 'Sensor activo';

  if (sensor.code === 'air_quality_index' && config.getColor) {
    const aqData = config.getColor(sensor.value);
    if (aqData) {
      displayValue = aqData.name;
      valueColor = aqData.color;
      description = `Índice: ${sensor.value}`;
      progressBar = (
        <div className="progress-track" aria-label="Progreso de calidad del aire">
          <div className="progress-fill" style={{ width: `${aqData.progress}%`, background: aqData.color }}></div>
        </div>
      );
    }
  }

  if (typeof sensor.value === 'boolean') {
    displayValue = sensor.value ? 'SÍ' : 'NO';
    valueColor = sensor.value ? 'var(--success)' : 'var(--danger)';
  }

  const title = sensor.name || config.title;

  const isNumeric = typeof sensor.value === 'number' && Number.isFinite(sensor.value);
  const animated = useAnimatedNumber(isNumeric ? sensor.value : 0);
  const niceNumber = useMemo(() => {
    if (!isNumeric) return displayValue;
    const num = Math.round(animated * 100) / 100;
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  }, [animated, isNumeric, displayValue]);

  const pctLike = ['battery_percentage', 'humidity_value'];
  if (!progressBar && pctLike.includes(sensor.code) && typeof sensor.value === 'number') {
    const clamp = Math.max(0, Math.min(100, sensor.value));
    progressBar = (
      <div className="progress-track" aria-label={`Nivel de ${title}`}>
        <div className="progress-fill" style={{ width: `${clamp}%` }}></div>
      </div>
    );
  }

  const trendIcon = useMemo(() => {
    if (!history.length || typeof history[0] !== 'number') return null;
    const start = history[0];
    const end = history[history.length - 1];
    if (end > start) return <i className="fas fa-arrow-trend-up" aria-label="Subiendo" />;
    if (end < start) return <i className="fas fa-arrow-trend-down" aria-label="Bajando" />;
    return <i className="fas fa-arrows-left-right" aria-label="Estable" />;
  }, [history]);

  return (
    <article onClick={onClick} className={`metric-card ${config.cardClass || ''}`} style={{ animationDelay: `${index * 0.06}s` }}>
      <header className="card-header">
        <div className="metric-info">
          <div className="metric-icon"><i className={config.icon}></i></div>
          <div className="metric-title">{title}</div>
        </div>
        <div className="trend-indicator">
          {trendIcon}
          <span>Live</span>
        </div>
      </header>

      <div className="metric-value" style={{ color: valueColor }}>
        {isNumeric ? niceNumber : displayValue}<span className="metric-unit">{config.unit || ''}</span>
      </div>

      <div className="metric-description">{description}</div>

      {history.length > 1 && <Sparkline points={history} />}

      {progressBar}
    </article>
  );
}
