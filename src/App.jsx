import React, { useEffect, useRef, useState } from 'react';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import { LayoutDashboard, AreaChart as ChartsIcon, Smartphone, Settings, Waves, Menu, X } from 'lucide-react';
import './App.css';

// 👇 PON AQUÍ LA URL EXACTA DE TU API EN VIVO
// Si es local puede ser 'http://localhost:3000' o la URL correcta de Railway
const API_BASE_URL = 'https://apisensor-production.up.railway.app'; 

function useSensorHistory(sensors, maxPoints = 30) {
  const historyRef = useRef(new Map());

  useEffect(() => {
    sensors.forEach((s) => {
      const key = s.code || s.name;
      if (!key) return;
      if (!historyRef.current.has(key)) historyRef.current.set(key, []);
      const arr = historyRef.current.get(key);
      const numeric = typeof s.value === 'number' ? s.value : NaN;
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
  const [isHidden, setIsHidden] = useState(document.hidden);

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedLocation, setSelectedLocation] = useState('Cara Sucia');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const history = useSensorHistory(sensors);

  useEffect(() => {
    const onVisibility = () => setIsHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    let fetchInterval;
    const fetchSensors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/sensors/formatted`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        
        if (data.success && data.sensors) {
          setSensors(data.sensors);
          setStatus({ connected: true, message: 'Live' });
        }
      } catch (err) {
        console.error("Error consultando API:", err);
        setStatus({ connected: false, message: 'Reconectando...' });
      }
    };

    fetchSensors();
    fetchInterval = setInterval(fetchSensors, isHidden ? 10000 : 3000);
    return () => clearInterval(fetchInterval);
  }, [isHidden]);

  const handleNavClick = (view) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  const DevicesView = () => <div className="placeholder-view">Gestión de dispositivos en construcción.</div>;
  const SettingsView = () => <div className="placeholder-view">Configuración del sistema.</div>;

  return (
    <div className="app-container">
      
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            <h1><Waves size={20} color="#a1a1aa"/> SensorOuso</h1>
            <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} color="#a1a1aa" />
            </button>
          </div>
          
          <nav className="nav-links">
            <button className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavClick('dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button className={`nav-link ${activeView === 'charts' ? 'active' : ''}`} onClick={() => handleNavClick('charts')}>
              <ChartsIcon size={20} /> Charts
            </button>
            <button className={`nav-link ${activeView === 'devices' ? 'active' : ''}`} onClick={() => handleNavClick('devices')}>
              <Smartphone size={20} /> Devices
            </button>
            <button className={`nav-link ${activeView === 'settings' ? 'active' : ''}`} onClick={() => handleNavClick('settings')}>
              <Settings size={20} /> Settings
            </button>
          </nav>
        </div>
        
        <div className="sidebar-footer">
          <div className="avatar"></div> Profile
        </div>
      </aside>

      <main className="main-content">
        <header className="header-bar">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={28} color="#f4f4f5" />
            </button>
            
            <div className="header-title-section">
              <h1>{activeView === 'dashboard' ? 'Sensor Dashboard' : 'Análisis de Datos'}</h1>
              <p>{activeView === 'dashboard' ? 'Monitoreo Ambiental en Tiempo Real' : 'Comparativa de tendencias históricas'}</p>
            </div>
          </div>
          
          <div className="location-tabs-container">
            <div className="location-tabs">
              {['Cara Sucia', 'Nahuizalco', 'Juayua'].map(location => (
                <button 
                  key={location} 
                  className={`location-tab ${selectedLocation === location ? 'active' : ''}`}
                  onClick={() => setSelectedLocation(location)}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
          
          <div className="status-indicator">
             <div className={`status-dot ${status.connected ? 'green' : 'red'}`}></div>
          </div>
        </header>

        <div className="dashboard-view-container">
          {activeView === 'dashboard' && <Dashboard sensors={sensors} history={history} />}
          {activeView === 'charts' && <Analytics history={history} />}
          {activeView === 'devices' && <DevicesView />}
          {activeView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

export default App;