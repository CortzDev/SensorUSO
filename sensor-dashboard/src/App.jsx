import React, { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StatusMap from './components/StatusMap';
import SensorModal from './components/SensorModal';
import './App.css';

const API_BASE_URL = 'https://apisensor-production.up.railway.app';

function useSensorHistory(sensors, maxPoints = 30) {
  const historyRef = useRef(new Map());

  useEffect(() => {
    sensors.forEach((s) => {
      const key = s.code || s.name;
      if (!key) return;
      if (!historyRef.current.has(key)) historyRef.current.set(key, []);
      const arr = historyRef.current.get(key);
      const numeric = typeof s.value === 'number'
        ? s.value
        : (typeof s.value === 'boolean' ? (s.value ? 1 : 0) : NaN);
      if (!Number.isNaN(numeric)) {
        arr.push(numeric);
        if (arr.length > maxPoints) arr.shift();
      }
    });
  }, [sensors, maxPoints]);

  const out = {};
  historyRef.current.forEach((v, k) => (out[k] = [...v]));
  return out;
}

function App() {
  const [sensors, setSensors] = useState([]);
  const [status, setStatus] = useState({ connected: false, message: 'Conectando...' });
  const [lastUpdate, setLastUpdate] = useState('--:--:--');
  const [error, setError] = useState(null);
  const [isHidden, setIsHidden] = useState(document.hidden);

  const history = useSensorHistory(sensors);

  const [selected, setSelected] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const openDetail = (sensor) => { setSelected(sensor); setOpenModal(true); };
  const closeDetail = () => setOpenModal(false);

  useEffect(() => {
    const onVisibility = () => setIsHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    let fetchInterval;
    let backoff = 3000;

    const fetchSensors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/sensors/formatted`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Error en la respuesta de la red');
        const data = await response.json();
        if (data.success && data.sensors) {
          setSensors(data.sensors);
          setStatus({ connected: true, message: 'Conectado' });
          setError(null);
          setLastUpdate(
            new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
          backoff = 3000;
        } else {
          throw new Error('No se encontraron datos de sensores');
        }
      } catch (err) {
        setStatus({ connected: false, message: 'Error de conexión' });
        setError(err.message);
        backoff = Math.min(backoff * 1.6, 20000);
      }
    };

    fetchSensors();

    fetchInterval = setInterval(fetchSensors, isHidden ? 10000 : backoff);

    const timer = setInterval(() => {
      setLastUpdate(
        new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(timer);
    };
  }, [isHidden]);

  return (
    <div className="container">
      <Header status={status} lastUpdate={lastUpdate} />

      {!status.connected && (
        <div className="banner banner-danger" role="status" aria-live="polite">
          <i className="fas fa-triangle-exclamation" /> Conexión perdida. Intentando reconectar...
          {error && <span className="banner-note"> ({error})</span>}
        </div>
      )}

      <div className="section-wrapper">
        <StatusMap sensors={sensors} />
      </div>

      <div className="section-wrapper">
        <Dashboard
          sensors={sensors}
          status={status}
          history={history}
          onOpenDetail={openDetail}
        />
      </div>

      <SensorModal
        open={openModal}
        onClose={closeDetail}
        sensor={selected}
        history={selected ? history[selected.code || selected.name] : []}
        unit={selected ? (selected.unit || '') : ''}
      />

      <footer className="footer">
        <span>© {new Date().getFullYear()} Sensor Cara Sucia · Monitor Ambiental</span>
        <span className="footer-dot" />
        <a href={API_BASE_URL} target="_blank" rel="noreferrer" className="api-url">API</a>
      </footer>
    </div>
  );
}

export default App;
