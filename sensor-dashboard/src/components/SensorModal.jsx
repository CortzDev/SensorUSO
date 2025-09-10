import React, { useMemo } from 'react';

function BigChart({ points = [] }) {
  const path = useMemo(() => {
    if (!points.length) return '';
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    const w = 600, h = 220, step = w / Math.max(1, points.length - 1);
    return points.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / span) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [points]);

  const min = points.length ? Math.min(...points) : 0;
  const max = points.length ? Math.max(...points) : 0;
  const last = points.length ? points[points.length - 1] : 0;

  return (
    <div className="bigchart-wrap">
      <svg viewBox="0 0 600 220" preserveAspectRatio="none" className="bigchart">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--info)" />
            <stop offset="100%" stopColor="var(--success)" />
          </linearGradient>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(66,153,225,0.35)" />
            <stop offset="100%" stopColor="rgba(66,153,225,0.00)" />
          </linearGradient>
        </defs>
        {path && (<>
          <path d={path + ' L600,220 L0,220 Z'} fill="url(#fillGrad)" />
          <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth="3" />
        </>)}
      </svg>
      <div className="bigchart-legend">
        <div><span className="k">Min</span><strong>{Number.isFinite(min) ? min.toFixed(2) : '--'}</strong></div>
        <div><span className="k">Max</span><strong>{Number.isFinite(max) ? max.toFixed(2) : '--'}</strong></div>
        <div><span className="k">Último</span><strong>{Number.isFinite(last) ? last.toFixed(2) : '--'}</strong></div>
      </div>
    </div>
  );
}

export default function SensorModal({ open, onClose, sensor, history = [], unit = '' }) {
  if (!open || !sensor) return null;

  const title = sensor.name || sensor.code || 'Sensor';
  const value = typeof sensor.value === 'number' ? sensor.value.toFixed(2) : String(sensor.value);

  const ranges = (() => {
    switch (sensor.code) {
      case 'temp_current': return [
        { label: 'Frío', range: '< 18°C' },
        { label: 'Óptimo', range: '18–25°C' },
        { label: 'Cálido', range: '> 25°C' },
      ];
      case 'humidity_value': return [
        { label: 'Seco', range: '< 40%' },
        { label: 'Óptimo', range: '40–60%' },
        { label: 'Alto', range: '> 60%' },
      ];
      case 'co2_value': return [
        { label: 'Bueno', range: '< 800 ppm' },
        { label: 'Atención', range: '800–1000 ppm' },
        { label: 'Ventilar', range: '> 1000 ppm' },
      ];
      default: return [
        { label: 'Bajo', range: '—' },
        { label: 'Medio', range: '—' },
        { label: 'Alto', range: '—' },
      ];
    }
  })();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <header className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar"><i className="fas fa-times"/></button>
        </header>

        <div className="modal-body">
          <div className="modal-kpis">
            <div className="kpi">
              <span className="k">Valor actual</span>
              <strong>{value}{unit}</strong>
            </div>
            <div className="kpi">
              <span className="k">Lecturas</span>
              <strong>{history.length}</strong>
            </div>
            <div className="kpi">
              <span className="k">Código</span>
              <strong>{sensor.code}</strong>
            </div>
          </div>

          <BigChart points={history} />

          <div className="ranges">
            <h4>Rangos sugeridos</h4>
            <ul>
              {ranges.map((r, i) => <li key={i}><span>{r.label}</span><b>{r.range}</b></li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
