import React, { useState, useCallback } from 'react';
import reportService from '../../services/reportService';
import ReportFilters from '../../components/reports/ReportFilters';
import { exportToExcel } from '../../utils/exportToExcel';
import { DocumentDownloadIcon } from '@heroicons/react/solid';

const StockReportPage = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = useCallback(async (filters) => {
        try {
            setLoading(true);
            const data = await reportService.getStockReport(filters);
            setReportData(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleExport = () => {
        if (reportData.length > 0) {
            exportToExcel(reportData, 'Stock_Report');
        } else {
            alert('No data to export.');
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Stock Report</h1>
                <button
                    onClick={handleExport}
                    disabled={reportData.length === 0}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
                >
                    <DocumentDownloadIcon className="-ml-1 mr-2 h-5 w-5" />
                    Export to Excel
                </button>
            </div>

            <ReportFilters onFilterChange={fetchReport} />

            {error && <div className="text-red-500 bg-red-100 p-4 rounded-md mb-4">Error: {error}</div>}

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width (mm)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GSM</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock (RM)</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock (SQM)</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="9" className="text-center py-10">Loading report...</td></tr>
                        ) : (
                            reportData.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.BranchName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.Manufacturer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.Grade}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(item.Width).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.GSM}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">{parseFloat(item.StockRM).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{parseFloat(item.StockSQM).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{parseFloat(item.Rate).toFixed(4)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-800">{parseFloat(item.Amount).toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {reportData.length === 0 && !loading && (
                     <div className="text-center py-8 bg-white"><p className="text-gray-500">No data found for the selected filters. Click "Apply Filters" to generate the report.</p></div>
                )}
            </div>
        </div>
    );
};

export default StockReportPage;
