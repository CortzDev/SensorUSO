import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://apisensor-production.up.railway.app';

function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  return (
    <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Cambiar tema">
      <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
    </button>
  );
}

function Header({ status, lastUpdate }) {
    return (
        <header className="header">
            <div className="header-row">
              <h1><i className="fas fa-home"></i> Sensor Zona 1</h1>
              <ThemeToggle />
            </div>
            <p className="subtitle">Monitor Ambiental Inteligente</p>
            <div className="status-bar" role="status" aria-live="polite">
                <div className="status-indicator">
                    <div className={`pulse-dot ${!status.connected ? 'offline' : ''}`}></div>
                    <span>{status.connected ? 'Sistema Activo' : 'Sistema Offline'}</span>
                </div>
                <div className="status-indicator">
                    <i className="fas fa-wifi"></i>
                    <span>{status.message}</span>
                </div>
                <div className="status-indicator">
                    <i className="fas fa-clock"></i>
                    <span>{lastUpdate}</span>
                </div>
                <div className="status-indicator">
                    <i className="fas fa-server"></i>
                    <span>Railway {status.connected ? '✓' : '✗'}</span>
                </div>
            </div>
            <div className="api-info">
                Conectado a: <a href={API_BASE_URL} className="api-url" target="_blank" rel="noopener noreferrer">{API_BASE_URL}</a>
            </div>
        </header>
    );
}

export default Header;
