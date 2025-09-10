import React, { useMemo } from 'react';
import { sensorConfig } from '../utils/sensorConfig';

export default function StatusMap({ sensors = [] }) {
  const computed = useMemo(() => {
    const classify = (s) => {
      if (s.code === 'air_quality_index') {
        if (s.value === 'level_1') return { level: 'ok',   score: 0.2, note: 'Buena' };
        if (s.value === 'level_2') return { level: 'warn', score: 0.6, note: 'Moderada' };
        if (s.value === 'level_3') return { level: 'crit', score: 1.0, note: 'Mala' };
      }
      if (s.code === 'humidity_value' && typeof s.value === 'number') {
        if (s.value < 40 || s.value > 60) return { level: 'warn', score: 0.6, note: 'Fuera de óptimo' };
        return { level: 'ok', score: 0.2, note: 'Óptimo' };
      }
      if (s.code === 'temp_current' && typeof s.value === 'number') {
        if (s.value < 18 || s.value > 25) return { level: 'warn', score: 0.6, note: 'Fuera de confort' };
        return { level: 'ok', score: 0.2, note: 'Confort' };
      }
      if (s.code === 'co2_value' && typeof s.value === 'number') {
        if (s.value > 1000) return { level: 'crit', score: 1.0, note: 'Ventilación' };
        if (s.value > 800)  return { level: 'warn', score: 0.6, note: 'Atención' };
        return { level: 'ok', score: 0.2, note: 'Bueno' };
      }
      if (s.code === 'battery_percentage' && typeof s.value === 'number') {
        if (s.value <= 10) return { level: 'crit', score: 1.0, note: 'Batería crítica' };
        if (s.value <= 20) return { level: 'warn', score: 0.6, note: 'Batería baja' };
        return { level: 'ok', score: 0.2, note: 'OK' };
      }
      return { level: 'ok', score: 0.3, note: 'Activo' };
    };

    const items = sensors.map((s) => {
      const cfg = sensorConfig[s.code] || {};
      const meta = classify(s);
      return {
        key: s.code || s.name,
        title: s.name || cfg.title || s.code,
        icon: cfg.icon || 'fas fa-circle',
        level: meta.level,
        note: meta.note,
        score: meta.score
      };
    });

    const counts = items.reduce((acc, it) => {
      acc[it.level] = (acc[it.level] || 0) + 1;
      return acc;
    }, {});

    return { items, counts };
  }, [sensors]);

  return (
    <section className="statusmap" aria-labelledby="statusmap-title">
      <header className="statusmap-header">
        <h3 id="statusmap-title">
          <i className="fas fa-map" aria-hidden /> Mapa de estado general
        </h3>
        <div className="pill-group" role="list">
          <span className="pill ok" role="listitem">OK {computed.counts.ok || 0}</span>
          <span className="pill warn" role="listitem">Atención {computed.counts.warn || 0}</span>
          <span className="pill crit" role="listitem">Crítico {computed.counts.crit || 0}</span>
        </div>
      </header>

      <div className="statusmap-grid">
        {computed.items.map((it) => (
          <article key={it.key} className={`sm-chip ${it.level}`} aria-label={it.title}>
            <div className="sm-icon" aria-hidden><i className={it.icon}/></div>
            <div className="sm-body">
              <div className="sm-title">{it.title}</div>
              <div className="sm-note">{it.note}</div>
              <div className="sm-heat" aria-hidden>
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className={`sq ${i/9 <= it.score ? 'on' : ''}`}/>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
