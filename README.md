# Sistema de Monitoreo de Sensores Ambientales

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey)]()

## Descripción

Este proyecto implementa una solución integral para la recolección, almacenamiento, procesamiento y visualización de datos ambientales en tiempo real. Permite analizar variables como temperatura, humedad, calidad del aire y concentración de partículas mediante una arquitectura modular y escalable.

---

## Características

- Recolección de datos desde sensores ambientales
- Almacenamiento en base de datos PostgreSQL
- API REST para acceso a la información
- Visualización de datos mediante dashboard interactivo
- Exportación de datos en formato CSV
- Comparación de métricas por rango de tiempo y dispositivos

---

## Arquitectura

El sistema está dividido en múltiples capas:

- **Adquisición de datos:** sensores ambientales  
- **Procesamiento (ETL):** scripts en Python  
- **Persistencia:** base de datos PostgreSQL  
- **Backend:** API REST con Node.js y Express  
- **Frontend:** dashboard para visualización  

---

## Tecnologías

- Node.js  
- Express  
- PostgreSQL  
- Python  
- REST API  
- Herramientas de visualización de datos  

---

## Estructura del Proyecto


/api # Backend (API REST)
/database # Scripts y esquemas SQL
/scripts # Procesamiento de datos
/dashboard # Interfaz gráfica


---
