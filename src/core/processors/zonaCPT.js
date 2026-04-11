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
 * CPT_ORDEN — orden de aparición de los CPTs en la tabla de CutOff.
 * Para agregar un nuevo CPT, agregarlo acá en el orden deseado.
 */
export const CPT_ORDEN = [
  '0:00','1:00','2:00','3:00','4:00','5:00','6:00',
  '7:00','8:00','9:00','10:00','11:00','13:00'
];

export const getCPTdeZona = (zona) => {
  if (!zona) return null;
  const z = String(zona).toUpperCase().trim().replace(/_+$/, "");
  if (ZONA_CPT[z]) return ZONA_CPT[z];
  for (const key of Object.keys(ZONA_CPT)) {
    if (z.startsWith(key) || key.startsWith(z)) return ZONA_CPT[key];
  }
  return null;
};
