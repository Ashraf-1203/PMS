import React, { useState, useEffect } from 'react';
import paperService from '../../services/paperService';
import inventoryService from '../../services/inventoryService';
import { useNavigate } from 'react-router-dom';

const ReceivePaperPage = () => {
    const [papers, setPapers] = useState([]);
    const [selectedPaper, setSelectedPaper] = useState('');
    const [quantityRm, setQuantityRm] = useState('');
    const [remarks, setRemarks] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

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
            await inventoryService.receivePaper({
                paperId: selectedPaper,
                quantityRm,
                remarks,
            });
            setSuccess(`Successfully received ${quantityRm} RM of paper. Stock has been updated.`);
            // Clear form
            setSelectedPaper('');
            setQuantityRm('');
            setRemarks('');
            // Optional: navigate away after a delay
            // setTimeout(() => navigate('/inventory/issued'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Receive Paper</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{success}</div>}

                    <div>
                        <label htmlFor="paper" className="block text-sm font-medium text-gray-700">Select Paper</label>
                        <select
                            id="paper"
                            name="paper"
                            value={selectedPaper}
                            onChange={(e) => setSelectedPaper(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">-- Choose a paper --</option>
                            {papers.map(p => (
                                <option key={p.PaperID} value={p.PaperID}>
                                    {p.Manufacturer} - {p.Grade} - {p.Width}mm - (Branch: {p.BranchName})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="quantityRm" className="block text-sm font-medium text-gray-700">Quantity (Running Meters)</label>
                        <input
                            type="number"
                            id="quantityRm"
                            name="quantityRm"
                            value={quantityRm}
                            onChange={(e) => setQuantityRm(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                        <textarea
                            id="remarks"
                            name="remarks"
                            rows="3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        ></textarea>
                    </div>

                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {loading ? 'Receiving...' : 'Receive Paper'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReceivePaperPage;
