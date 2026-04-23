// Horas del plan de vehículos (9hs a 23hs)
export const PLAN_HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 9;
  return `${String(h).padStart(2, '0')}:00`;
});

// Plan vacío por defecto
export const emptyPlan = () =>
  PLAN_HOURS.map(hora => ({ hora, chasis: 0, camioneta: 0, semi: 0 }));

// Merge: agrega columna planTotal y planChasis/planCamioneta/planSemi al vehiculosChartData
export const mergePlanConReal = (vehiculosChartData = [], planVehiculos = []) => {
  const planMap = Object.fromEntries(
    planVehiculos.map(r => [r.hora, r])
  );

  return vehiculosChartData.map(d => {
    const p = planMap[d.hora] || { chasis: 0, camioneta: 0, semi: 0 };
    return {
      ...d,
      planCamioneta: Number(p.camioneta) || 0,
      planChasis:    Number(p.chasis)    || 0,
      planSemi:      Number(p.semi)      || 0,
      planTotal:     (Number(p.chasis) || 0) + (Number(p.camioneta) || 0) + (Number(p.semi) || 0),
      realTotal:     (Number(d.chasis) || 0) + (Number(d.camioneta) || 0) + (Number(d.semi) || 0),
    };
  });
};
