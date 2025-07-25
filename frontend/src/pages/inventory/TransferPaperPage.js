import React, { useState, useEffect } from 'react';
import paperService from '../../services/paperService';
import branchService from '../../services/branchService';
import transferService from '../../services/transferService';

const TransferPaperPage = () => {
    const [papers, setPapers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [filteredPapers, setFilteredPapers] = useState([]);

    const [sourceBranchId, setSourceBranchId] = useState('');
    const [destinationBranchId, setDestinationBranchId] = useState('');
    const [paperId, setPaperId] = useState('');
    const [quantityRm, setQuantityRm] = useState('');
    const [remarks, setRemarks] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const papersData = await paperService.getPapers();
                const branchesData = await branchService.getActiveBranches();
                setPapers(papersData.filter(p => p.IsActive && p.StockRM > 0));
                setBranches(branchesData);
            } catch (err) {
                setError('Failed to load initial data.');
            }
        };
        loadData();
    }, []);

    const handleSourceBranchChange = (e) => {
        const branchId = e.target.value;
        setSourceBranchId(branchId);
        setFilteredPapers(papers.filter(p => p.BranchID === branchId));
        setPaperId(''); // Reset paper selection
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await transferService.initiateTransfer({
                sourceBranchId,
                destinationBranchId,
                paperId,
                quantityRm,
                remarks,
            });
            setSuccess('Transfer initiated successfully. It now requires approval from the destination branch.');
            // Clear form
            setSourceBranchId('');
            setDestinationBranchId('');
            setPaperId('');
            setQuantityRm('');
            setRemarks('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedPaperDetails = papers.find(p => p.PaperID === paperId);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Transfer Paper</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">{success}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="sourceBranch" className="block text-sm font-medium text-gray-700">From Branch</label>
                            <select id="sourceBranch" value={sourceBranchId} onChange={handleSourceBranchChange} required className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="">-- Select Source --</option>
                                {branches.map(b => <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="destinationBranch" className="block text-sm font-medium text-gray-700">To Branch</label>
                            <select id="destinationBranch" value={destinationBranchId} onChange={(e) => setDestinationBranchId(e.target.value)} required disabled={!sourceBranchId} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100">
                                <option value="">-- Select Destination --</option>
                                {branches.filter(b => b.BranchID !== sourceBranchId).map(b => <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="paper" className="block text-sm font-medium text-gray-700">Paper to Transfer</label>
                        <select id="paper" value={paperId} onChange={(e) => setPaperId(e.target.value)} required disabled={!sourceBranchId} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100">
                            <option value="">-- Select Paper --</option>
                            {filteredPapers.map(p => (
                                <option key={p.PaperID} value={p.PaperID}>
                                    {p.Manufacturer} - {p.Grade} - {p.Width}mm ({parseFloat(p.StockRM).toFixed(2)} RM)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="quantityRm" className="block text-sm font-medium text-gray-700">Quantity to Transfer (RM)</label>
                        <input
                            type="number"
                            id="quantityRm"
                            value={quantityRm}
                            onChange={(e) => setQuantityRm(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                            max={selectedPaperDetails?.StockRM}
                            disabled={!paperId}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                         {selectedPaperDetails && <p className="text-xs text-gray-500 mt-1">Available at source: {parseFloat(selectedPaperDetails.StockRM).toFixed(2)} RM</p>}
                    </div>

                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                        <textarea id="remarks" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"></textarea>
                    </div>

                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={loading || !paperId || !destinationBranchId}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Initiating...' : 'Initiate Transfer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferPaperPage;
