import React, { useState, useEffect } from 'react';
import paperService from '../../services/paperService';
import inventoryService from '../../services/inventoryService';

const PaperAdjustmentPage = () => {
    const [papers, setPapers] = useState([]);
    const [selectedPaper, setSelectedPaper] = useState('');
    const [adjustmentType, setAdjustmentType] = useState('Add');
    const [quantityRm, setQuantityRm] = useState('');
    const [remarks, setRemarks] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        paperService.getPapers()
            .then(data => setPapers(data.filter(p => p.IsActive)))
            .catch(err => setError('Failed to fetch papers.'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await inventoryService.adjustStock({
                paperId: selectedPaper,
                adjustmentType,
                quantityRm,
                remarks,
            });
            setSuccess(`Stock for the selected paper has been successfully adjusted.`);
            // Refresh paper list to show updated stock
            paperService.getPapers().then(data => setPapers(data.filter(p => p.IsActive)));
            // Clear form
            setSelectedPaper('');
            setAdjustmentType('Add');
            setQuantityRm('');
            setRemarks('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedPaperDetails = papers.find(p => p.PaperID === selectedPaper);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Paper Adjustment</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{success}</div>}

                    <div>
                        <label htmlFor="paper" className="block text-sm font-medium text-gray-700">Select Paper (Current Stock)</label>
                        <select
                            id="paper"
                            value={selectedPaper}
                            onChange={(e) => setSelectedPaper(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">-- Choose a paper --</option>
                            {papers.map(p => (
                                <option key={p.PaperID} value={p.PaperID}>
                                    {p.Manufacturer} - {p.Grade} - {p.Width}mm ({parseFloat(p.StockRM).toFixed(2)} RM)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="adjustmentType" className="block text-sm font-medium text-gray-700">Adjustment Type</label>
                            <select
                                id="adjustmentType"
                                value={adjustmentType}
                                onChange={(e) => setAdjustmentType(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option>Add</option>
                                <option>Subtract</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="quantityRm" className="block text-sm font-medium text-gray-700">Quantity (RM)</label>
                            <input
                                type="number"
                                id="quantityRm"
                                value={quantityRm}
                                onChange={(e) => setQuantityRm(e.target.value)}
                                required
                                min="0.01"
                                step="0.01"
                                max={adjustmentType === 'Subtract' ? selectedPaperDetails?.StockRM : undefined}
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks (Reason for adjustment)</label>
                        <textarea
                            id="remarks"
                            rows="3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            required
                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        ></textarea>
                    </div>

                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={loading || !selectedPaper || !quantityRm}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Adjusting...' : 'Adjust Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaperAdjustmentPage;
