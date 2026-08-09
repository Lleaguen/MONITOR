/*
 * ─── ZONA_CPT ────────────────────────────────────────────────────────────────
 * Mapa de Labeling Zone → CPT (hora de corte).
 *
 * Para agregar una nueva zona:
 *   NombreZona: 'HH:00'
 *
 * Para cambiar el CPT de una zona existente, modificar el valor.
 *
 * Zonas excluidas del conteo HU (manejadas en huProcessor.js):
 *   - Zonas que terminan en _A o _B (Meli Air)
 *   - FBA1_R
 *   - Zonas en minúscula
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ZONA_CPT = {
  OCS060: '0:00', OCS061: '0:00', OCS070: '0:00', SBH1: '0:00', SBH1_X: '0:00',
  SCO1: '0:00', SCO2: '0:00',
  OCS062: '1:00', OCS064: '1:00', SER1: '1:00', SRU1: '1:00', SRU2: '1:00',
  HOP300: '2:00', OCS063: '2:00', OCS067: '2:00', OCS069: '2:00', SGU1: '2:00',
  SRF1: '2:00', SRO1: '2:00', SRO2: '2:00', SSF1: '2:00', SSF1_X: '2:00',
  SSR1: '2:00', SSR1_X: '2:00', SVI1: '2:00', URB150: '2:00',
  AND010: '3:00', AND011: '3:00', OCS066: '3:00', SBU2: '3:00', SBU3_1: '3:00',
  SBU4: '3:00', SCF2: '3:00', SCF3: '3:00', SCK1: '3:00', SCS3: '3:00',
  SCZ1: '3:00', STD1: '3:00', STQ1: '3:00', SBU6: '3:00',
  OCS052: '4:00', CK350: '4:00', PCK350: '4:00', SJN1: '4:00', SLA1: '4:00',
  SMQ1: '4:00', SPG1: '4:00', SPN1: '4:00', WEB200: '4:00', WEB202: '4:00',
  SBU1: '4:00', SBU5: '4:00', SCF4: '4:00',
  SBU3_2: '5:00', SJU1: '5:00', SST1: '5:00', SRV1: '5:00', STU1: '5:00',
  STU1_X: '5:00', STW1: '5:00', SRSC_1: '5:00',
  SBC1: '6:00',
  COR125: '7:00', COR126: '7:00', SCO1_X: '7:00', SPS1: '7:00', SRE1: '7:00',
  SRE1_X: '7:00', URB175: '7:00',
  AND027: '8:00', AND028: '8:00', AND031: '8:00', AND032: '8:00', AND033: '8:00',
  SNQ1: '8:00', SNQ2: '8:00',
  AND025: '9:00', AND029: '9:00', AND030: '9:00', SLU1: '9:00', SME1: '9:00',
  SME1_X: '9:00', SSJ1: '9:00',
  AND040: '10:00', COR140: '10:00', OCA291: '10:00',
  AND034: '11:00', AND035: '11:00', FBA1_R: '11:00',
  CK390: '13:00', PCK390: '13:00',
};

/*
 * CPT_ORDEN — orden de aparición de los CPTs en la tabla de CutOff (CIU).
 * Para agregar un nuevo CPT, agregarlo acá en el orden deseado.
 */
export const CPT_ORDEN = [
  '0:00','1:00','2:00','3:00','4:00','5:00','6:00',
  '7:00','8:00','9:00','10:00','11:00','13:00'
];

export const getCPTdeZona = (zona, zonaCPTMap = ZONA_CPT) => {
  if (!zona) return null;
  const z = String(zona).toUpperCase().trim().replace(/_+$/, "");
  if (zonaCPTMap[z]) return zonaCPTMap[z];
  for (const key of Object.keys(zonaCPTMap)) {
    if (z.startsWith(key) || key.startsWith(z)) return zonaCPTMap[key];
  }
  return null;
};

/*
 * ─── ZONA_CPT_EEV ────────────────────────────────────────────────────────────
 * Mapa de Labeling Zone → CPT para el site Echeverría (EEV).
 *
 * Columnas (color → CPT):
 *   ROJO      → 0:00  (col 00:00)
 *   ROSA      → 1:00  (col 01:00)
 *   AMARILLO  → 2:00  (col 02:00 y 03:00)
 *   AZUL      → 4:00  (col 04:00 y 05:00)
 *   VERDE     → 6:00  (col 06:00 y 08:00)
 *   MELI AIR  → 0:00  (col 00:00 — tratadas como _A/_B)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ZONA_CPT_EEV = {
  // ROJO — CPT 0:00
  OCS060: '0:00', OCS061: '0:00', SSR1: '0:00', SRF1: '0:00',
  SCO2: '0:00', STD1: '0:00', SCO1: '0:00', SER1: '0:00',
  SBH1: '0:00', SCZ1: '0:00', SVI1: '0:00', SGU1: '0:00',
  SSR1_X: '0:00', SCK1: '0:00', OCS070: '0:00', SBH1_X: '0:00',
  SCS3: '0:00', STQ1: '0:00',

  // ROSA — CPT 1:00
  OCS062: '1:00', SCF4: '1:00', SBU5: '1:00', SMQ1: '1:00',
  OCS064: '1:00', OCS066: '1:00', SPN1: '1:00', SRU2: '1:00',
  SLA1: '1:00', SRU1: '1:00', SPG1: '1:00', SJN1: '1:00',
  SBU1: '1:00',

  // AMARILLO — CPT 2:00 (columna 02:00 y 03:00)
  OCS063: '2:00', OCS069: '2:00', AND010: '2:00', STU1: '2:00',
  SBU6: '2:00', SRV1: '2:00', SST1: '2:00', SRO1: '2:00',
  SRSC1_2: '2:00', SRU2_2: '2:00', SSF1: '2:00', SSF1_X: '2:00',
  SJU1: '2:00', SBU3_2: '2:00', STU1_X: '2:00', STW1: '2:00',
  SRO2: '2:00', SRSC1_1: '2:00', SBU2: '2:00', SCF2: '2:00',
  AND011: '2:00', SBU3_1: '2:00', SBC1: '2:00', SCF3: '2:00',
  SBU4: '2:00',

  // AZUL — CPT 4:00 (columna 04:00 y 05:00)
  COR125: '4:00', COR126: '4:00', SRE1: '4:00', OCS052: '4:00',
  SPS1: '4:00', FBA1_R: '4:00', SCO1_X: '4:00', SUS1_C: '4:00',
  PCK350: '4:00', SRE1_X: '4:00', AND040: '4:00', PCK390: '4:00',
  SNQ1: '4:00', OCA291: '4:00', COR140: '4:00', AND025: '4:00',
  AND027: '4:00', AND028: '4:00', AND029: '4:00', AND030: '4:00',
  AND031: '4:00', AND032: '4:00', AND033: '4:00', AND034: '4:00',
  AND035: '4:00', SNQ2: '4:00', SNQ1_X: '4:00',

  // VERDE — CPT 6:00 (columna 06:00 y 08:00)
  SME1: '6:00', SSJ1: '6:00', SLU1: '6:00', SME1_X: '6:00',
  SUS1_C: '6:00',
};

/*
 * CPT_ORDEN_EEV — orden de aparición de los CPTs para EEV.
 */
export const CPT_ORDEN_EEV = ['0:00', '1:00', '2:00', '4:00', '6:00'];

/*
 * SITES — configuración de sites disponibles.
 */
export const SITES = {
  CIU: {
    label: 'Soldati',
    code: 'CIU',
    zonaCPT: null, // null = usar ZONA_CPT default
    cptOrden: null, // null = usar CPT_ORDEN default
  },
  EEV: {
    label: 'Echeverría',
    code: 'EEV',
    zonaCPT: 'EEV',
    cptOrden: 'EEV',
  },
};
