import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, RefreshCw, BarChart2, Activity } from 'lucide-react';

// API Local/Interna exclusiva para el análisis de datos históricos
const API_BASE_URL = 'http://localhost:8000'; 

export default function Analytics() {
  const [var1, setVar1] = useState('co2_value');
  const [var2, setVar2] = useState('temp_current');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Opciones de métricas
  const metrics = {
    co2_value: { label: 'CO2 (ppm)', color: '#2563eb' },
    temp_current: { label: 'Temperatura (°C)', color: '#dc2626' },
    humidity_value: { label: 'Humedad (%)', color: '#059669' },
    pm25_value: { label: 'Partículas PM 2.5', color: '#c084fc' },
    battery_percentage: { label: 'Batería (%)', color: '#fb923c' },
    none: { label: 'Sin comparación', color: 'transparent' }
  };

  // Función para consumir tu API en Python
  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      console.log(`📡 Solicitando datos a: ${API_BASE_URL}/api/metrics`);
      // Armamos los parámetros de búsqueda para la API
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (!startDate && !endDate) params.append('limit', '100'); // Límite por defecto si no hay filtros

      const response = await fetch(`${API_BASE_URL}/api/metrics?${params.toString()}`);
      console.log(`📥 Respuesta HTTP recibida:`, response.status);
      if (!response.ok) throw new Error('Error al conectar con la API');
      
      const result = await response.json();
      console.log(`📊 Datos procesados de BD:`, result.data?.length);
      
      if (result.data) {
        const formattedData = result.data.map(item => ({
          ...item,
          // Forzamos los datos a numéricos (Recharts no dibuja strings)
          co2_value: item.co2_value != null ? Number(item.co2_value) : null,
          temp_current: item.temp_current != null ? Number(item.temp_current) : null,
          humidity_value: item.humidity_value != null ? Number(item.humidity_value) : null,
          pm25_value: item.pm25_value != null ? Number(item.pm25_value) : null,
          battery_percentage: item.battery_percentage != null ? Number(item.battery_percentage) : null,
          // Formateamos la fecha
          time: new Date(item.recorded_at).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })
        }));
        setChartData(formattedData);
      }
    } catch (error) {
      console.error("Error descargando métricas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos por primera vez al abrir Analytics
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Cálculos estadísticos (Min, Max, Avg)
  const getStats = (data, variable) => {
    if (!data || data.length === 0 || variable === 'none') return null;
    const values = data.map(d => d[variable]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return null;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    return { min: min.toFixed(1), max: max.toFixed(1), avg: avg.toFixed(1) };
  };

  const stats1 = getStats(chartData, var1);
  const stats2 = getStats(chartData, var2);

  const downloadCSV = () => {
    if (chartData.length === 0) return;
    const columns = ['time', var1, ...(var2 !== 'none' ? [var2] : [])];
    const header = columns.join(",");
    const rows = chartData.map(row => columns.map(col => row[col] || '').join(","));
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Export_Sensores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="analytics-container">
      {/* CONTROLES TIPO BENTO */}
      <div className="bento-card">
        <div className="bento-header">
          <BarChart2 size={18} />
          <span>Filtros de Análisis</span>
        </div>
        
        <div className="analytics-controls-grid">
          <div className="control-group">
            <label>Inicio</label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="control-group">
            <label>Fin</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="control-group">
            <label>Métrica Principal</label>
            <select value={var1} onChange={(e) => setVar1(e.target.value)}>
              {Object.entries(metrics).filter(([k]) => k !== 'none').map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label>Comparativa</label>
            <select value={var2} onChange={(e) => setVar2(e.target.value)}>
              {Object.entries(metrics).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="analytics-buttons">
            <button className="btn-primary" onClick={fetchMetrics} disabled={isLoading}>
              <RefreshCw size={16} /> {isLoading ? 'Cargando...' : 'Actualizar'}
            </button>
            <button className="btn-outline" onClick={downloadCSV}>
              <Download size={16} /> CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="analytics-stats-grid">
        <div className="bento-card" style={{ padding: '1.25rem' }}>
          <div className="bento-header">Registros Totales</div>
          <div className="bento-title" style={{ fontSize: '2rem' }}>{chartData.length}</div>
        </div>

        <div className="bento-card" style={{ borderTop: `4px solid ${metrics[var1].color}`, padding: '1.25rem' }}>
          <div className="bento-header">{metrics[var1].label}</div>
          {stats1 ? (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Mín</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats1.min}</div></div>
              <div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Prom</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats1.avg}</div></div>
              <div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Máx</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats1.max}</div></div>
            </div>
          ) : <p>Sin datos</p>}
        </div>

        <div className="bento-card" style={{ borderTop: `4px solid ${metrics[var2]?.color || 'transparent'}`, opacity: var2 === 'none' ? 0.5 : 1, padding: '1.25rem' }}>
          <div className="bento-header">{var2 !== 'none' ? metrics[var2].label : 'Secundaria'}</div>
          {stats2 && var2 !== 'none' ? (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Mín</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats2.min}</div></div>
              <div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Prom</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats2.avg}</div></div>
              <div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Máx</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats2.max}</div></div>
            </div>
          ) : <p style={{ color: '#64748b' }}>Sin comparación</p>}
        </div>
      </div>

      {/* CHART BENTO CARD */}
      <div className="bento-card" style={{ flex: 1, minHeight: '400px' }}>
        <div className="bento-header">
          <Activity size={18} />
          <span>Tendencia Histórica</span>
        </div>
        {/* Forzamos un alto estricto de 400px para evitar que la gráfica colapse */}
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis yAxisId="left" stroke={metrics[var1].color} tick={{ fill: '#64748b', fontSize: 12 }} />
            {var2 !== 'none' && (
              <YAxis yAxisId="right" orientation="right" stroke={metrics[var2].color} tick={{ fill: '#64748b', fontSize: 12 }} />
            )}
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#f4f4f5' }}
              itemStyle={{ color: '#f4f4f5' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey={var1} 
              name={metrics[var1].label} 
              stroke={metrics[var1].color} 
              strokeWidth={3}
              fill={metrics[var1].color} 
              fillOpacity={0.1} 
            />
            
            {var2 !== 'none' && (
              <Area 
                yAxisId="right" 
                type="monotone" 
                dataKey={var2} 
                name={metrics[var2].label} 
                stroke={metrics[var2].color} 
                strokeWidth={3}
                fill={metrics[var2].color} 
                fillOpacity={0.1} 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}