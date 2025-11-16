import React, { useMemo } from 'react';
import { sensorConfig } from '../utils/sensorConfig';

/**
 * StatusMap — versión simple y ordenada
 * - No hace filas manuales: renderiza todos los items en un solo grid.
 * - El CSS se encarga del orden y del responsive (2x5 en móvil).
 * - Mantiene la clasificación ok/warn/crit y los icons.
 */
export default function StatusMap({ sensors = [] }) {
  const items = useMemo(() => {
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
      return 'ok';
    };

    // Filtrar sensores si deseas ocultar algunos (opcional)
    const ocultar = ['battery_percentage', 'battery_status', 'estado_carga', 'charge_state'];
    const filtered = sensors.filter(s => {
      const code = (s.code || '').toLowerCase();
      const name = (s.name || '').toLowerCase();
      return !ocultar.some(k => code.includes(k) || name.includes(k));
    });

    return filtered.map((s) => {
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

      {/* Un solo grid: el CSS decide cuántas columnas mostrar */}
      <div className="statusmap-grid compact" role="list" aria-label="Mapa de estado general">
        {items.map(it => (
          <article
            key={it.key}
            className={`sm-chip compact ${it.level}`}
            aria-label={it.title}
            title={it.title}
            role="listitem"
          >
            <div className="sm-icon" aria-hidden><i className={it.icon} /></div>
            <div className="sm-body">
              <div className="sm-title">{it.title}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
