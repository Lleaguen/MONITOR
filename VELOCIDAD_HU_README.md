# Gráfica de Velocidad de HU - Pulso de Descarga

## 📊 Descripción

Nueva funcionalidad que visualiza la **velocidad de armado de HU (Handling Units)** usando el **pulso de descarga** como métrica principal. Esta gráfica permite monitorear en tiempo real la productividad del proceso de armado de HU a lo largo del turno.

## 🎯 Características

### 1. **Gráfica de Velocidad por Hora**
- **Barras apiladas** que muestran:
  - 🟢 **HU Cerrados** (verde): Unidades completamente armadas
  - 🟡 **HU Abiertos** (amarillo): Unidades en proceso de armado
- **Eje X**: Horas del turno (desde hora de inicio configurada hasta las 23:00)
- **Eje Y**: Cantidad de HU procesados por hora
- **Tooltip interactivo** con desglose detallado por hora

### 2. **Tarjetas de Estadísticas**
Muestra 4 métricas clave:
- **Total HU**: Suma total de HU cerrados y abiertos
- **Velocidad Promedio**: HU/hora promedio durante el turno
- **Velocidad Pico**: Máxima cantidad de HU procesados en una hora
- **Hora Pico**: Hora en la que se alcanzó la velocidad máxima

### 3. **Tabla de Velocidad por CPT**
- Muestra la velocidad de cada CPT en las **últimas 3 horas**
- Columnas:
  - CPT
  - HU Cerrados
  - HU Abiertos
  - Total
  - Velocidad (HU/hr)
- **Responsive**: Vista de tabla en desktop, cards en mobile
- Ordenada por total descendente

## 🔧 Implementación Técnica

### Archivos Creados

1. **`src/core/processors/huVelocidadProcessor.js`**
   - Processor que calcula la velocidad de HU por hora
   - Agrupa HU cerrados y abiertos por hora y CPT
   - Calcula estadísticas: promedio, pico, hora pico
   - Filtra datos de las últimas 3 horas para la tabla de CPT

2. **`src/features/dashboard/components/HUVelocidadChart.jsx`**
   - Componente React que renderiza la gráfica
   - Usa Recharts para visualización
   - Incluye tooltip personalizado
   - Responsive design (desktop/mobile)

### Archivos Modificados

1. **`src/core/dataProcessor.js`**
   - Importa `buildHUVelocidadData`
   - Ejecuta el processor en el flujo principal
   - Agrega `huVelocidadData` al objeto de retorno

2. **`src/features/dashboard/pages/CommandCenter.jsx`**
   - Importa `HUVelocidadChart`
   - Renderiza el componente en una nueva sección
   - Ubicado después de la tabla de HU y antes de TargetCards

## 📐 Lógica de Cálculo

### Clasificación de HU

```javascript
// HU Cerrado: tiene fecha de cierre
if (d['Outbound Date Closed']) {
  // Contar como HU cerrado en la hora de cierre
}

// HU Abierto: tiene fecha de inclusión pero NO fecha de cierre
if (d['Outbound Included Date'] && !d['Outbound Date Closed']) {
  // Contar como HU abierto en la hora de inclusión
}
```

### Filtros Aplicados

Los mismos filtros que `huProcessor.js`:
- ✅ Solo piezas con Shipment ID válido
- ✅ Solo zonas en MAYÚSCULAS
- ❌ Excluye zonas Meli Air (_A, _B)
- ❌ Excluye CK390
- ❌ Excluye estados: cancelled, in_hub_reject, blocked
- ✅ Solo zonas mapeadas a un CPT

### Cálculo de Velocidad

```javascript
// Velocidad Promedio
velocidadPromedio = totalHU / horasConActividad

// Velocidad Pico
velocidadPico = max(HU por hora)

// Velocidad por CPT (últimas 3 horas)
velocidadPorHora = totalHU_CPT / 3
```

## 🎨 Diseño Visual

### Colores
- **HU Cerrados**: `#34d399` (emerald-400) - Verde
- **HU Abiertos**: `#fbbf24` (yellow-400) - Amarillo
- **Fondo**: `#111827` con opacidad variable
- **Bordes**: `white/5` - Blanco con 5% opacidad

### Tipografía
- **Títulos**: Font-black, tracking-tight
- **Labels**: Font-black, uppercase, tracking-widest
- **Valores**: Font-black con colores temáticos

### Responsive
- **Desktop**: Tabla completa con todas las columnas
- **Mobile**: Cards apiladas con grid de 3 columnas

## 🚀 Uso

La gráfica se renderiza automáticamente en el CommandCenter cuando hay datos disponibles:

```jsx
<HUVelocidadChart huVelocidadData={data.huVelocidadData} />
```

### Props

- `huVelocidadData`: Objeto con estructura:
  ```javascript
  {
    velocidadPorHora: [
      { hora: '10:00', huCerrados: 45, huAbiertos: 12, total: 57 },
      // ...
    ],
    velocidadPorCPT: [
      { cpt: '0:00', huCerrados: 120, huAbiertos: 30, total: 150, velocidadPorHora: 50 },
      // ...
    ],
    stats: {
      totalHUCerrados: 1234,
      totalHUAbiertos: 456,
      totalHU: 1690,
      velocidadPromedio: 120,
      velocidadPico: 180,
      horaPico: '15:00',
      horasConActividad: 14
    }
  }
  ```

## 📊 Interpretación de Datos

### Velocidad Saludable
- **Verde (HU Cerrados)**: Indica productividad efectiva
- **Amarillo (HU Abiertos)**: Indica trabajo en progreso

### Señales de Alerta
- ⚠️ **Velocidad promedio baja**: Puede indicar falta de personal o problemas operativos
- ⚠️ **Muchos HU abiertos vs cerrados**: Posible cuello de botella en el cierre
- ⚠️ **Velocidad inconsistente**: Variaciones grandes entre horas

### Optimización
- 📈 **Hora pico**: Identificar qué factores contribuyeron al mejor rendimiento
- 📉 **Horas lentas**: Investigar causas y aplicar mejoras
- 🎯 **CPT lentos**: Enfocar recursos en CPTs con baja velocidad

## 🔄 Integración con Sistema Existente

La nueva funcionalidad se integra perfectamente con:
- ✅ **HUTable**: Complementa la vista de tabla con visualización temporal
- ✅ **HUObjetivoWidget**: Muestra objetivos vs velocidad real
- ✅ **Filtros de zona CPT**: Respeta los overrides configurados
- ✅ **Configuración de hora inicio**: Usa `horaInicioHU` del config

## 📝 Notas Técnicas

### Performance
- El processor itera el CSV una vez para HU por hora
- Segunda iteración para calcular velocidad por CPT (últimas 3 horas)
- Complejidad: O(n) donde n = número de filas en CSV

### Mantenimiento
- Para cambiar la ventana de tiempo de CPT: modificar `tresHorasAtras` en el processor
- Para agregar nuevos filtros: seguir el patrón de `huProcessor.js`
- Para cambiar colores: actualizar las clases de Tailwind en el componente

## 🐛 Troubleshooting

### La gráfica no aparece
- Verificar que `data.huVelocidadData` no sea null/undefined
- Revisar que haya datos en el CSV con fechas válidas
- Confirmar que la hora de inicio esté configurada correctamente

### Datos incorrectos
- Verificar formato de fechas: `DD/MM/YYYY HH:mm:ss`
- Confirmar que las zonas estén en MAYÚSCULAS
- Revisar que los CPT estén mapeados correctamente

### Problemas de renderizado
- Verificar que Recharts esté instalado: `npm list recharts`
- Revisar la consola del navegador para errores de React
- Confirmar que Tailwind esté compilando correctamente

## 🎯 Próximas Mejoras (Sugerencias)

1. **Filtros interactivos**: Permitir filtrar por CPT específico
2. **Comparación histórica**: Mostrar velocidad del día anterior
3. **Alertas automáticas**: Notificar cuando la velocidad cae bajo umbral
4. **Export de datos**: Botón para descargar datos de velocidad en CSV
5. **Predicción**: Proyectar velocidad necesaria para cumplir objetivo

---

**Autor**: Kiro AI  
**Fecha**: 2026-04-20  
**Versión**: 1.0.0
