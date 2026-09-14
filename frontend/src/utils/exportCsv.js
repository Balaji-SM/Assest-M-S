/**
 * Converts array of objects to CSV and triggers instant browser download
 * @param {Array} data - Array of row objects
 * @param {string} filename - Output filename (.csv)
 */
export const exportToCsv = (data, filename = 'export.csv') => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);

  // Convert rows
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
