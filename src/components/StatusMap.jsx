import React, { useMemo } from 'react';
import { sensorConfig } from '../utils/sensorConfig';

export default function StatusMap({ sensors = [] }) {
  const items = useMemo(() => {
    // Clasifica cada sensor para colorear (ok / warn / crit)
    const classify = (s) => {
      if (s.code === 'air_quality_index') {
        if (s.value === 'level_1') return 'ok';
        if (s.value === 'level_2') return 'warn';
        if (s.value === 'level_3') return 'crit';
      }
      if (s.code === 'humidity_value' && typeof s.value === 'number') {
        return (s.value < 40 || s.value > 60) ? 'warn' : 'ok';
      }
      if (s.code === 'temp_current' && typeof s.value === 'number') {
        return (s.value < 18 || s.value > 25) ? 'warn' : 'ok';
      }
      if (s.code === 'co2_value' && typeof s.value === 'number') {
        if (s.value > 1000) return 'crit';
        if (s.value > 800)  return 'warn';
        return 'ok';
      }
      if (s.code === 'battery_percentage' && typeof s.value === 'number') {
        if (s.value <= 10) return 'crit';
        if (s.value <= 20) return 'warn';
        return 'ok';
      }
      // Por defecto: ok
      return 'ok';
    };

    return sensors.map((s) => {
      const cfg = sensorConfig[s.code] || {};
      return {
        key: s.code || s.name,
        title: s.name || cfg.title || s.code,
        icon: cfg.icon || 'fas fa-circle',
        level: classify(s),
      };
    });
  }, [sensors]);

  return (
    <section className="statusmap" aria-labelledby="statusmap-title">
      <header className="statusmap-header">
        <h3 id="statusmap-title">
          <i className="fas fa-map" aria-hidden /> Mapa de estado general
        </h3>
      </header>

      <div className="statusmap-grid compact">
        {items.map((it) => (
          <article
            key={it.key}
            className={`sm-chip compact ${it.level}`} // ← clase según estado
            aria-label={it.title}
            title={it.title}
          >
            <div className="sm-icon" aria-hidden><i className={it.icon}/></div>
            <div className="sm-body">
              <div className="sm-title">{it.title}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
