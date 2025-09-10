import React from 'react';
import MetricCard from './MetricCard';

export default function Dashboard({ sensors, status, history, onOpenDetail }) {
  if (!status.connected && sensors.length === 0) {
    return (
      <main className="dashboard-grid">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-text">{status.message}...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-grid">
      {sensors.map((sensor, index) => (
        <MetricCard
          key={sensor.code || index}
          sensor={sensor}
          index={index}
          history={history[sensor.code || sensor.name] || []}
          onClick={() => onOpenDetail(sensor)}
        />
      ))}
    </main>
  );
}
