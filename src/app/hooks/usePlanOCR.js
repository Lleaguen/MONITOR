import { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { emptyPlan } from '../../core/vehiculosPlan';

/**
 * Invierte los colores de la imagen (fondo oscuro → fondo claro)
 * para mejorar la precisión de Tesseract.
 * Devuelve una dataURL con la imagen procesada.
 */
const invertImage = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Dibujar imagen original
      ctx.drawImage(img, 0, 0);

      // Invertir píxeles
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i]     = 255 - data[i];     // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
        // alpha (i+3) sin cambios
      }
      ctx.putImageData(imageData, 0, 0);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = url;
  });

/**
 * Parsea el texto OCR de la tabla del plan de vehículos.
 * Busca líneas que comiencen con un número entre 9 y 23 (la hora),
 * seguidas de 3 o más valores numéricos (camioneta, chasis, semi).
 */
const parsePlanText = (text) => {
  console.log('📋 Texto OCR recibido:\n', text);

  const plan = emptyPlan();

  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  lines.forEach(line => {
    // Extraer solo los números de la línea
    const nums = line.match(/\d+/g);
    if (!nums || nums.length < 2) return;

    const hora = parseInt(nums[0]);

    // La hora tiene que ser válida (9-23)
    if (isNaN(hora) || hora < 9 || hora > 23) return;

    const horaStr = `${String(hora).padStart(2, '0')}:00`;
    const idx = plan.findIndex(r => r.hora === horaStr);
    if (idx === -1) return;

    // Orden de columnas según la imagen: camioneta(1), chasis(2), semi(3)
    // Si hay 4+ números el último puede ser el total — lo ignoramos
    const camioneta = parseInt(nums[1]) || 0;
    const chasis    = parseInt(nums[2]) || 0;
    const semi      = nums[3] !== undefined ? parseInt(nums[3]) || 0 : 0;

    // Sanity check: valores razonables (< 200 vehículos por hora por tipo)
    if (camioneta > 200 || chasis > 200 || semi > 200) return;

    plan[idx] = { hora: horaStr, camioneta, chasis, semi };
    console.log(`  ✓ Hora ${horaStr}: camioneta=${camioneta} chasis=${chasis} semi=${semi}`);
  });

  return plan;
};

export const usePlanOCR = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const processImage = async (file) => {
    setLoading(true);
    setError(null);
    try {
      // Invertir imagen para mejorar OCR en fondos oscuros
      const invertedDataUrl = await invertImage(file);

      const worker = await createWorker('eng', 1, {
        logger: () => {},
      });

      // Sin whitelist — dejar que Tesseract reconozca todo para mejor detección de estructura
      await worker.setParameters({
        tessedit_pageseg_mode: '6', // Assume a single uniform block of text
      });

      const { data: { text } } = await worker.recognize(invertedDataUrl);
      await worker.terminate();

      const plan = parsePlanText(text);

      // Verificar que se hayan detectado al menos algunas horas
      const horasDetectadas = plan.filter(r => r.camioneta > 0 || r.chasis > 0 || r.semi > 0).length;
      if (horasDetectadas === 0) {
        setError('No se detectaron datos en la imagen. Verificá que la tabla sea visible y con buen contraste.');
        return null;
      }

      return plan;
    } catch (e) {
      setError('Error al procesar la imagen. Intentá con una imagen más clara.');
      console.error('OCR error:', e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { processImage, loading, error };
};
