import React, { useState, useEffect, useCallback } from 'react';
import paperService from '../../services/paperService';
import inventoryService from '../../services/inventoryService';
import { useDebounce } from '../../hooks/useDebounce'; // A custom hook for debouncing

const ReturnedPaperPage = () => {
    const [papers, setPapers] = useState([]);
    const [selectedPaper, setSelectedPaper] = useState('');
    const [quantityKg, setQuantityKg] = useState('');
    const [remarks, setRemarks] = useState('');
    const [calculatedRm, setCalculatedRm] = useState('0.00');

    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const debouncedKg = useDebounce(quantityKg, 500); // Debounce input for 500ms

    useEffect(() => {
        paperService.getPapers()
            .then(data => setPapers(data.filter(p => p.IsActive)))
            .catch(err => setError('Failed to fetch papers.'));
    }, []);

    const calculateRm = useCallback(async (paperId, kg) => {
        if (!paperId || !kg || parseFloat(kg) <= 0) {
            setCalculatedRm('0.00');
            return;
        }
        setCalculating(true);
        try {
            const response = await inventoryService.calculateReturnRm({ paperId, quantityKg: kg });
            setCalculatedRm(response.calculatedRm);
        } catch (err) {
            // Do not show calculation error to user, just reset to 0
            setCalculatedRm('0.00');
            console.error("Calculation error:", err.message);
        } finally {
            setCalculating(false);
        }
    }, []);

    useEffect(() => {
        calculateRm(selectedPaper, debouncedKg);
    }, [selectedPaper, debouncedKg, calculateRm]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await inventoryService.returnPaper({
                paperId: selectedPaper,
                quantityKg,
                remarks,
            });
            setSuccess(`Successfully returned paper. ${response.returnedRm} RM was added to stock.`);
            // Clear form
            setSelectedPaper('');
            setQuantityKg('');
            setRemarks('');
            setCalculatedRm('0.00');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Return Paper</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{success}</div>}

                    <div>
                        <label htmlFor="paper" className="block text-sm font-medium text-gray-700">Select Paper</label>
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
                                    {p.Manufacturer} - {p.Grade} - {p.Width}mm - (Branch: {p.BranchName})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="quantityKg" className="block text-sm font-medium text-gray-700">Quantity to Return (KG)</label>
                            <input
                                type="number"
                                id="quantityKg"
                                value={quantityKg}
                                onChange={(e) => setQuantityKg(e.target.value)}
                                required
                                min="0.01"
                                step="0.01"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Calculated RM (after deductions)</label>
                            <div className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm h-[38px] flex items-center">
                                {calculating ? (
                                    <span className="text-gray-500 italic text-xs">Calculating...</span>
                                ) : (
                                    <span className="font-semibold text-green-600">{calculatedRm} RM</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                        <textarea
                            id="remarks"
                            rows="3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        ></textarea>
                    </div>

                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={loading || calculating || parseFloat(calculatedRm) <= 0}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Returning...' : 'Return Paper to Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Simple debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

export default ReturnedPaperPage;
