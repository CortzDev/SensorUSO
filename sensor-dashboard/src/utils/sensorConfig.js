export const sensorConfig = {
  'air_quality_index': {
    icon: 'fas fa-lungs', title: 'Calidad del Aire',
    getColor: (value) => {
      switch (value) {
        case 'level_1': return { name: 'Buena', color: 'var(--success)', progress: 33 };
        case 'level_2': return { name: 'Moderada', color: 'var(--warning)', progress: 66 };
        case 'level_3': return { name: 'Mala', color: 'var(--danger)', progress: 100 };
        default: return { name: 'Desconocida', color: 'var(--muted)', progress: 0 };
      }
    }
  },
  'temp_current': { icon: 'fas fa-thermometer-half', title: 'Temperatura', unit: '°C', cardClass: 'temperature-card', getDescription: (v) => v > 25 ? 'Ambiente cálido' : v < 18 ? 'Ambiente frío' : 'Temperatura ideal' },
  'humidity_value': { icon: 'fas fa-tint', title: 'Humedad', unit: '%', cardClass: 'humidity-card', getDescription: (v) => v > 60 ? 'Humedad alta' : v < 40 ? 'Ambiente seco' : 'Humedad óptima' },
  'co2_value': { icon: 'fab fa-phoenix-framework', title: 'CO₂', unit: 'ppm', cardClass: 'co2-card', getDescription: (v) => v > 1000 ? 'Ventilación necesaria' : 'Nivel aceptable' },
  'ch2o_value': { icon: 'fas fa-flask', title: 'Formaldehído', unit: 'mg/m³', getDescription: () => 'Compuesto orgánico volátil' },
  'pm25_value': { icon: 'fas fa-smog', title: 'PM2.5', unit: 'μg/m³', getDescription: (v) => v > 35 ? 'Partículas elevadas' : 'Aire limpio' },
  'pm1': { icon: 'fas fa-wind', title: 'PM1.0', unit: 'μg/m³', getDescription: () => 'Partículas ultrafinas' },
  'pm10': { icon: 'fas fa-smog', title: 'PM10', unit: 'μg/m³', getDescription: (v) => v > 50 ? 'Partículas elevadas' : 'Nivel aceptable' },
  'battery_percentage': { icon: 'fas fa-battery-full', title: 'Batería', unit: '%', cardClass: 'battery-card', getDescription: (v) => v > 20 ? 'Batería suficiente' : 'Batería baja' },
  'charge_state': { icon: 'fas fa-plug', title: 'Estado de Carga', getDescription: (v) => v ? 'Cargando' : 'Desconectado' }
};

export const defaultConfig = {
  icon: 'fas fa-chart-line', title: 'Sensor Desconocido', unit: '',
  getDescription: () => 'Sensor activo'
};
