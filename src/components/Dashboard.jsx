import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Wind, Thermometer, Droplets, Activity, Cloud, BatteryCharging } from 'lucide-react';

const RingProgress = ({ value, max, color, label, subtext, size = 120, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(value / max, 1));
  const strokeDashoffset = circumference - percent * circumference;

  return (
    <div className="ring-progress-container" style={{ maxWidth: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="ring-svg">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#27272a" strokeWidth={strokeWidth} fill="none" />
        <circle 
          cx={size / 2} cy={size / 2} r={radius} 
          stroke={color} strokeWidth={strokeWidth} fill="none" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="ring-text-container">
        <span className="ring-label">{label}</span>
        {subtext && <span className="ring-subtext">{subtext}</span>}
      </div>
    </div>
  );
};

export default function Dashboard({ sensors, history }) {
  const getSensor = (code) => sensors.find(s => s.code === code) || { value: 0 };
  
  const temp = getSensor('temp_current');
  const humidity = getSensor('humidity_value');
  const co2 = getSensor('co2_value');
  const pm25 = getSensor('pm25_value');
  const pm10 = getSensor('pm10');
  const pm1 = getSensor('pm1');
  const ch2o = getSensor('ch2o_value');
  const battery = getSensor('battery_percentage');
  
  const co2History = (history['co2_value'] || []).map((val, i) => ({ time: i, value: val }));
  if (co2History.length === 0) co2History.push({value: 600}, {value: co2.value || 600});

  const humHistory = (history['humidity_value'] || []).map((val, i) => ({ time: i, value: val }));
  if (humHistory.length === 0) humHistory.push({value: 50}, {value: humidity.value || 50});

  const aqiValue = pm25.value;
  const aqiText = aqiValue <= 25 ? 'Good' : aqiValue <= 50 ? 'Moderate' : 'Poor';
  const aqiColor = aqiValue <= 25 ? '#22c55e' : aqiValue <= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="bento-dashboard">
      
      {/* 1. CALIDAD DE AIRE */}
      <div className="bento-card bento-aqi">
        <div className="bento-header"><Wind size={18} color="#22c55e"/> Air Quality</div>
        <div className="aqi-content-centered">
          <div className="bento-title" style={{ color: aqiColor, marginBottom: '1rem' }}>{aqiText}</div>
          <RingProgress value={aqiValue} max={100} color={aqiColor} label={aqiValue} subtext="AQI" size={130} strokeWidth={10} />
        </div>
      </div>

      {/* 2. TEMPERATURA */}
      <div className="bento-card bento-temp">
        <div className="bento-header"><Thermometer size={18} color="#f97316"/> Temperature</div>
        <div className="temp-content">
          <RingProgress value={temp.value} max={50} color="#f97316" label={`${temp.value}°C`} size={160} strokeWidth={12} />
        </div>
      </div>

      {/* 3. HUMEDAD */}
      <div className="bento-card bento-hum">
        <div className="bento-header"><Droplets size={18} color="#0ea5e9"/> Humidity</div>
        <div className="hum-content-professional">
          <RingProgress value={humidity.value} max={100} color="#0ea5e9" label={`${humidity.value}%`} size={140} strokeWidth={10} />
        </div>
        <div className="hum-chart-bg">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={humHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
              <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fill="#0ea5e9" fillOpacity={0.3} activeDot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. CO2 LEVEL */}
      <div className="bento-card bento-co2">
        <div className="bento-header"><Activity size={18} color="#eab308"/> CO2 Level</div>
        <div className="co2-value-container">
          <span className="co2-value">{co2.value}</span>
          <span className="co2-unit">ppm</span>
        </div>
        <div className="co2-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={co2History} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin - 50', 'dataMax + 50']} hide />
              <Area type="monotone" dataKey="value" stroke="#eab308" strokeWidth={4} fill="url(#co2Gradient)" activeDot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. TARJETAS APILADAS (Fondos oscuros pero con iconos a color) */}
      <div className="bento-side-stack">
        <div className="mini-card">
          <div>
            <div className="mini-label">PM2.5</div>
            <div className="mini-value">{pm25.value} <span className="unit-small">µg/m³</span></div>
          </div>
          <Cloud size={24} color="#c084fc" opacity={0.8} /> {/* Morado */}
        </div>

        <div className="mini-card">
          <div>
            <div className="mini-label">PM10</div>
            <div className="mini-value">{pm10.value} <span className="unit-small" style={{color: '#71717a'}}>µg/m³</span></div>
          </div>
          <Droplets size={24} color="#38bdf8" opacity={0.8} /> {/* Azul */}
        </div>

        <div className="mini-card">
          <div>
            <div className="mini-label">PM1</div>
            <div className="mini-value">{pm1.value} <span className="unit-small" style={{color: '#71717a'}}>µg/m³</span></div>
          </div>
          <Wind size={24} color="#94a3b8" opacity={0.8} /> {/* Gris/Plata */}
        </div>

        <div className="mini-card">
          <div>
            <div className="mini-label">CH2O</div>
            <div className="mini-value">{ch2o.value} <span className="unit-small" style={{color: '#71717a'}}>mg/m³</span></div>
          </div>
          <Activity size={24} color="#4ade80" opacity={0.8} /> {/* Verde */}
        </div>

        <div className="mini-card battery-card">
          <div className="bento-header" style={{ marginBottom: 0 }}>Battery</div>
          <div className="battery-value">{battery.value}%</div>
          <div className="battery-status">
            <BatteryCharging size={18} color="#22c55e" /> Charging
          </div>
        </div>
      </div>

    </div>
  );
}