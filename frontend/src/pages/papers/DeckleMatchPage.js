import React, { useState, useEffect } from 'react';
import paperService from '../../services/paperService';

const DeckleMatchPage = () => {
    const [papers, setPapers] = useState([]);
    const [sourcePaperId, setSourcePaperId] = useState('');
    const [cutWidth, setCutWidth] = useState('');
    const [quantityRm, setQuantityRm] = useState('');

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
            await paperService.deckleMatch({
                sourcePaperId,
                cutWidth,
                quantityRm,
            });
            setSuccess('Deckle match completed successfully. Stock has been updated.');
            // Refresh paper list
            paperService.getPapers().then(data => setPapers(data.filter(p => p.IsActive && p.StockRM > 0)));
            // Clear form
            setSourcePaperId('');
            setCutWidth('');
            setQuantityRm('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedPaperDetails = papers.find(p => p.PaperID === sourcePaperId);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Deckle Match</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <p className="text-sm text-gray-600 mb-6">
                    This process allows you to split a wider paper roll into two narrower rolls.
                    The system will automatically create the new paper sizes if they don't exist and transfer the stock.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{success}</div>}

                    <div>
                        <label htmlFor="sourcePaper" className="block text-sm font-medium text-gray-700">Select Source Paper</label>
                        <select
                            id="sourcePaper"
                            value={sourcePaperId}
                            onChange={(e) => setSourcePaperId(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">-- Choose a source paper roll --</option>
                            {papers.map(p => (
                                <option key={p.PaperID} value={p.PaperID}>
                                    {p.Manufacturer} - {p.Grade} - {p.Width}mm ({parseFloat(p.StockRM).toFixed(2)} RM) - (Branch: {p.BranchName})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedPaperDetails && (
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <h3 className="font-semibold text-gray-700">Resulting Papers:</h3>
                            <p className="text-sm text-gray-600">
                                If you cut at <span className="font-bold">{cutWidth || '...'}mm</span>, you will get two new rolls:
                            </p>
                            <ul className="list-disc list-inside mt-2 text-sm">
                                <li>One roll of <span className="font-bold text-blue-600">{cutWidth || '...'}mm</span></li>
                                <li>One roll of <span className="font-bold text-blue-600">{(parseFloat(selectedPaperDetails.Width) - parseFloat(cutWidth || 0)).toFixed(2)}mm</span></li>
                            </ul>
                        </div>
                    )}

                    <div>
                        <label htmlFor="quantityRm" className="block text-sm font-medium text-gray-700">Quantity to Deckle (RM)</label>
                        <input
                            type="number"
                            id="quantityRm"
                            value={quantityRm}
                            onChange={(e) => setQuantityRm(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                            max={selectedPaperDetails?.StockRM}
                            disabled={!sourcePaperId}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                         {selectedPaperDetails && <p className="text-xs text-gray-500 mt-1">Available: {parseFloat(selectedPaperDetails.StockRM).toFixed(2)} RM</p>}
                    </div>

                    <div>
                        <label htmlFor="cutWidth" className="block text-sm font-medium text-gray-700">How much width to cut? (mm)</label>
                        <input
                            type="number"
                            id="cutWidth"
                            value={cutWidth}
                            onChange={(e) => setCutWidth(e.target.value)}
                            required
                            min="1"
                            max={selectedPaperDetails ? selectedPaperDetails.Width - 1 : undefined}
                            disabled={!sourcePaperId}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                    </div>

                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={loading || !sourcePaperId || !cutWidth || !quantityRm}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Processing...' : 'Perform Deckle Match'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeckleMatchPage;
