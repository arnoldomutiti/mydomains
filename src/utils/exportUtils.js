import * as XLSX from 'xlsx';
import { calculateDaysUntilExpiry } from './domainUtils';

export const exportToCSV = (domains, showModal) => {
  if (!domains || domains.length === 0) {
    showModal('Export Failed', 'No domains to export', 'error');
    return;
  }

  const headers = ['Domain Name', 'Status', 'Created Date', 'Expiry Date', 'Registrar'];
  const rows = domains.map(domain => [
    domain.name,
    domain.status,
    domain.created || domain.created_date || 'N/A',
    domain.expires || domain.expiry_date || 'N/A',
    domain.registrar || 'N/A'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `domains-export-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (domains, showModal) => {
  if (!domains || domains.length === 0) {
    showModal('Export Failed', 'No domains to export', 'error');
    return;
  }

  const data = domains.map(domain => ({
    'Domain Name': domain.name,
    'Status': domain.status,
    'Created Date': domain.created || domain.created_date || 'N/A',
    'Expiry Date': domain.expires || domain.expiry_date || 'N/A',
    'Registrar': domain.registrar || 'N/A',
    'Days Until Expiry': calculateDaysUntilExpiry(domain.expires || domain.expiry_date)
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Domains');

  const maxWidth = data.reduce((acc, row) => {
    Object.keys(row).forEach((key, i) => {
      const value = String(row[key]);
      acc[i] = Math.max(acc[i] || 10, value.length + 2, key.length + 2);
    });
    return acc;
  }, []);

  worksheet['!cols'] = maxWidth.map(w => ({ width: Math.min(w, 50) }));

  XLSX.writeFile(workbook, `domains-export-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const domains = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    const domain = {
      name: values[0],
      registrar: values[1] || null
    };

    if (domain.name && domain.name.includes('.')) {
      domains.push(domain);
    }
  }

  return domains;
};

export const parseExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const domains = jsonData.map(row => ({
          name: row['Domain Name'] || row['domain'] || row['Domain'] || '',
          registrar: row['Registrar'] || row['registrar'] || null
        })).filter(d => d.name && d.name.includes('.'));

        resolve(domains);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};
