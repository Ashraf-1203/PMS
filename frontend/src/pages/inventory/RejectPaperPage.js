import React, { useState, useEffect } from 'react';
import paperService from '../../services/paperService';
import inventoryService from '../../services/inventoryService';

const RejectPaperPage = () => {
    const [papers, setPapers] = useState([]);
    const [selectedPaper, setSelectedPaper] = useState('');
    const [quantityRm, setQuantityRm] = useState('');
    const [remarks, setRemarks] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        paperService.getPapers()
            .then(data => setPapers(data.filter(p => p.IsActive && p.StockRM > 0)))
            .catch(err => setError('Failed to fetch papers.'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await inventoryService.rejectPaper({
                paperId: selectedPaper,
                quantityRm,
                remarks,
            });
            setSuccess(`Successfully rejected ${quantityRm} RM of paper. Stock has been deducted.`);
            // Refresh paper list
            paperService.getPapers().then(data => setPapers(data.filter(p => p.IsActive && p.StockRM > 0)));
            // Clear form
            setSelectedPaper('');
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Reject Paper</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">{success}</div>}

                    <div>
                        <label htmlFor="paper" className="block text-sm font-medium text-gray-700">Select Paper to Reject</label>
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

                    <div>
                        <label htmlFor="quantityRm" className="block text-sm font-medium text-gray-700">Quantity to Reject (RM)</label>
                        <input
                            type="number"
                            id="quantityRm"
                            value={quantityRm}
                            onChange={(e) => setQuantityRm(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                            max={selectedPaperDetails?.StockRM}
                            disabled={!selectedPaper}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                         {selectedPaperDetails && <p className="text-xs text-gray-500 mt-1">Available: {parseFloat(selectedPaperDetails.StockRM).toFixed(2)} RM</p>}
                    </div>

                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks (Reason for rejection)</label>
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
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Rejecting...' : 'Reject Paper'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectPaperPage;
