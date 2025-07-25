import * as xlsx from 'xlsx';

export const exportToExcel = (data, fileName) => {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Report');

    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(
            key.length,
            ...data.map(row => (row[key] ? String(row[key]).length : 0))
        )
    }));
    worksheet['!cols'] = colWidths;

    xlsx.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
