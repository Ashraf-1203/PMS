import React, { useState, useCallback, useMemo } from 'react';
import reportService from '../../services/reportService';
import ReportFilters from '../../components/reports/ReportFilters'; // A modified version for transactions
import { exportToExcel } from '../../utils/exportToExcel';
import { DocumentDownloadIcon } from '@heroicons/react/solid';

// A modified version of filters for transaction reports
const TransactionReportFilters = ({ onFilterChange }) => {
    const [branches, setBranches] = useState([]);
    const [filters, setFilters] = useState({
        branchId: '',
        dateFrom: '',
        dateTo: '',
    });

    useEffect(() => {
        branchService.getActiveBranches().then(setBranches);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        onFilterChange(filters);
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Branch, DateFrom, DateTo filters */}
                <div className="w-full self-end">
                    <button onClick={handleApply} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md">Apply</button>
                </div>
            </div>
        </div>
    );
};


const TransactionReportPage = ({ reportType, title }) => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = useCallback(async (filters) => {
        try {
            setLoading(true);
            const data = await reportService.getTransactionReport(reportType, filters);
            setReportData(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [reportType]);

    const handleExport = () => {
        if (reportData.length > 0) {
            exportToExcel(reportData, `${reportType}_Report`);
        } else {
            alert('No data to export.');
        }
    };

    const columns = useMemo(() => {
        if (reportData.length === 0) return [];
        return Object.keys(reportData[0]).map(key => ({
            Header: key.replace(/([A-Z])/g, ' $1').trim(), // Add space before capital letters
            accessor: key,
        }));
    }, [reportData]);


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                <button
                    onClick={handleExport}
                    disabled={reportData.length === 0}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:bg-gray-400"
                >
                    <DocumentDownloadIcon className="-ml-1 mr-2 h-5 w-5" />
                    Export to Excel
                </button>
            </div>

            <TransactionReportFilters onFilterChange={fetchReport} />

            {error && <div className="text-red-500 bg-red-100 p-4 rounded-md mb-4">Error: {error}</div>}

            <div className="shadow overflow-x-auto border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map(col => (
                                <th key={col.accessor} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.Header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={columns.length} className="text-center py-10">Loading report...</td></tr>
                        ) : (
                            reportData.map((row, index) => (
                                <tr key={index}>
                                    {columns.map(col => (
                                        <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {typeof row[col.accessor] === 'boolean' ? String(row[col.accessor]) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {reportData.length === 0 && !loading && (
                     <div className="text-center py-8 bg-white"><p className="text-gray-500">No data found. Apply filters to generate the report.</p></div>
                )}
            </div>
        </div>
    );
};

export default TransactionReportPage;
