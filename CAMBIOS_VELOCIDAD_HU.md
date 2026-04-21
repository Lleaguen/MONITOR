# Cambios en Gráfica de Velocidad de HU

## 📅 Fecha: 2026-04-20

## 🔄 Cambios Realizados

### 1. Rango Horario Actualizado

**Antes:**
- Gráfica: Desde `horaInicioHU` (default: 10:00) hasta 23:00
- Tabla CPT: Últimas 3 horas

**Ahora:**
- Gráfica: Desde **13:00** hasta **23:00** horas
- Tabla CPT: Desde **13:30** hasta **22:30** horas

### 2. Cálculo de Velocidad por CPT

**Antes:**
```javascript
// Velocidad = Total HU / 3 horas fijas
velocidadPorHora: Math.round((total) / 3)
```

**Ahora:**
```javascript
// Velocidad = Total HU / horas transcurridas desde 13:30
const horasTranscurridas = Math.max(ahora.diff(inicioTurno, 'hour', true), 0.5);
velocidadPorHora: Math.round((total) / horasTranscurridas)
```

### 3. Filtros de Tiempo

**Tabla de Velocidad por CPT:**
```javascript
const inicioTurno = ahora.clone().hour(13).minute(30).second(0);
const finTurno = ahora.clone().hour(22).minute(30).second(0);

// Solo cuenta HU entre 13:30 y 22:30
if (ts.isAfter(inicioTurno) && ts.isBefore(finTurno)) {
  // Contar HU
}
```

**Gráfica por Hora:**
```javascript
const horaInicio = 13;

// Solo muestra horas desde las 13:00
if (ts.hour() >= horaInicio) {
  // Agregar a gráfica
}
```

### 4. Mejoras de UI

- ✅ Tabla siempre visible (incluso sin datos)
- ✅ Mensajes claros cuando no hay datos
- ✅ Logs de debug en consola
- ✅ Texto actualizado: "Desde las 13:30 hasta las 22:30 horas"

## 📊 Interpretación de Datos

### Velocidad por Hora (Gráfica)
- Muestra HU cerrados y abiertos por cada hora desde las 13:00
- Útil para identificar picos de productividad durante el turno

### Velocidad por CPT (Tabla)
- Calcula la velocidad promedio de cada CPT durante el turno (13:30 - 22:30)
- Fórmula: `Total HU del CPT / Horas transcurridas desde 13:30`
- Ordenada por total de HU (mayor a menor)

## 🎯 Ejemplo de Cálculo

**Escenario:**
- Hora actual: 18:00
- CPT "0:00" tiene 150 HU cerrados y 30 HU abiertos desde las 13:30

**Cálculo:**
```javascript
horasTranscurridas = 18:00 - 13:30 = 4.5 horas
totalHU = 150 + 30 = 180 HU
velocidadPorHora = 180 / 4.5 = 40 HU/hr
```

## 🔍 Debugging

Para ver los datos en la consola del navegador:

```javascript
HUVelocidadChart - Datos recibidos: {
  velocidadPorHora: 11,  // 11 horas (13:00 a 23:00)
  velocidadPorCPT: 8,    // 8 CPTs con actividad
  stats: {
    totalHU: 1234,
    velocidadPromedio: 120,
    velocidadPico: 180,
    horaPico: "15:00"
  }
}
```

## 📝 Archivos Modificados

1. **`src/core/processors/huVelocidadProcessor.js`**
   - Cambio de rango horario de gráfica (13:00 - 23:00)
   - Cambio de rango horario de tabla (13:30 - 22:30)
   - Cálculo dinámico de velocidad basado en horas transcurridas

2. **`src/features/dashboard/components/HUVelocidadChart.jsx`**
   - Tabla siempre visible
   - Logs de debug
   - Texto actualizado
   - Mejor manejo de casos sin datos
   - Limpieza de imports no utilizados

## ⚠️ Notas Importantes

1. **Hora de inicio fija**: La gráfica siempre empieza a las 13:00, independientemente del parámetro `horaInicioHU`
2. **Velocidad dinámica**: La velocidad por CPT se calcula en base a las horas transcurridas desde las 13:30, no un valor fijo
3. **Rango de tabla**: La tabla solo muestra HU procesados entre 13:30 y 22:30 (horario del turno)

## 🚀 Próximos Pasos Sugeridos

1. Hacer configurable el rango horario (13:30 - 22:30) desde parámetros
2. Agregar filtro para ver velocidad de un CPT específico
3. Agregar comparación con días anteriores
4. Exportar datos de la tabla a CSV

---

**Versión**: 1.1.0  
**Autor**: Kiro AI  
**Fecha**: 2026-04-20
