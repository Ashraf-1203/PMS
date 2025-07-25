import React, { useState, useEffect } from 'react';
import paperService from '../../services/paperService';
import branchService from '../../services/branchService';
import * as xlsx from 'xlsx';

const AddPaperPage = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [importResult, setImportResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        branchService.getActiveBranches()
            .then(setBranches)
            .catch(err => setError('Failed to load branches.'));
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImportResult(null); // Clear previous results
            setError('');

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const workbook = xlsx.read(event.target.result, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = xlsx.utils.sheet_to_json(worksheet);
                    setPreviewData(json);
                } catch (err) {
                    setError('Error reading or parsing the Excel file. Please ensure it is a valid .xlsx or .xls file.');
                    setPreviewData([]);
                }
            };
            reader.readAsBinaryString(selectedFile);
        }
    };

    const handleImport = async () => {
        if (!file || !selectedBranch) {
            setError('Please select a branch and a file to import.');
            return;
        }
        setLoading(true);
        setError('');
        setImportResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('branchId', selectedBranch);

        try {
            const result = await paperService.importPapers(formData);
            setImportResult(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Paper (Bulk Import)</h1>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">

                <div className="space-y-4">
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                        <h3 className="font-semibold text-blue-800">Instructions</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Upload an Excel file (.xlsx, .xls) with the following columns: <strong>manufacturer, grade, width, gsm, rate</strong>.
                            The system will prevent duplicate entries for the same paper within the selected branch.
                        </p>
                    </div>

                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <label htmlFor="branch" className="block text-sm font-medium text-gray-700">1. Select Branch for Import</label>
                            <select
                                id="branch"
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="">-- Choose a branch --</option>
                                {branches.map(b => <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">2. Upload Excel File</label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    {previewData.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">File Preview (first 10 rows)</h3>
                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg max-h-96 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            {Object.keys(previewData[0]).map(key => <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{key}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {previewData.slice(0, 10).map((row, i) => (
                                            <tr key={i}>
                                                {Object.values(row).map((val, j) => <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{String(val)}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleImport}
                                    disabled={loading || !selectedBranch}
                                    className="w-full md:w-auto inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                                >
                                    {loading ? 'Importing...' : `Confirm and Import ${previewData.length} Records`}
                                </button>
                            </div>
                        </div>
                    )}

                    {importResult && (
                        <div className="mt-6 p-4 border rounded-md bg-gray-50">
                            <h3 className="font-semibold text-lg text-gray-800">Import Complete</h3>
                            <p className="text-green-600">Successfully imported: {importResult.successCount}</p>
                            <p className="text-red-600">Failed: {importResult.failureCount}</p>
                            {importResult.errors?.length > 0 && (
                                <div className="mt-2">
                                    <h4 className="font-semibold">Error Details:</h4>
                                    <ul className="list-disc list-inside text-sm text-red-700 max-h-40 overflow-y-auto">
                                        {importResult.errors.map((err, i) => <li key={i}>Row {err.row}: {err.message}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddPaperPage;
