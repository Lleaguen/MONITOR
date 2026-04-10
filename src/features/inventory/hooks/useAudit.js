import { useState } from 'react';
import { parseCSVFile } from '../utils/csvParser';
import { runAudit } from '../utils/auditEngine';

export const useAudit = () => {
  const [auditResult, setAuditResult] = useState({});
  const [loading, setLoading] = useState(false);

  const run = async (file, apiUrl) => {
    setLoading(true);

    try {
      const csvData = await parseCSVFile(file);
      const res = await fetch(apiUrl);
      const apiData = await res.json();

      const result = runAudit(csvData, apiData);
      setAuditResult(result);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return { auditResult, run, loading };
};