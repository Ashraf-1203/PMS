import React, { useState, useEffect } from 'react';
import paperService from '../../services/paperService';
import machineService from '../../services/machineService';
import inventoryService from '../../services/inventoryService';
import { useNavigate } from 'react-router-dom';

const ConsumePaperPage = () => {
    const [papers, setPapers] = useState([]);
    const [machines, setMachines] = useState([]);
    const [filteredMachines, setFilteredMachines] = useState([]);

    const [selectedPaper, setSelectedPaper] = useState('');
    const [selectedMachine, setSelectedMachine] = useState('');
    const [jpcNumber, setJpcNumber] = useState('');
    const [quantityRm, setQuantityRm] = useState('');
    const [remarks, setRemarks] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const papersData = await paperService.getPapers();
                const machinesData = await machineService.getMachines();
                setPapers(papersData.filter(p => p.IsActive && p.StockRM > 0));
                setMachines(machinesData);
            } catch (err) {
                setError('Failed to load initial data.');
            }
        };
        loadData();
    }, []);

    const handlePaperChange = (e) => {
        const paperId = e.target.value;
        setSelectedPaper(paperId);

        // Filter machines based on the selected paper's branch
        const paper = papers.find(p => p.PaperID === paperId);
        if (paper) {
            setFilteredMachines(machines.filter(m => m.BranchID === paper.BranchID));
            setSelectedMachine(''); // Reset machine selection
        } else {
            setFilteredMachines([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await inventoryService.consumePaper({
                paperId: selectedPaper,
                machineId: selectedMachine,
                jpcNumber,
                quantityRm,
                remarks,
            });
            setSuccess(`Successfully consumed ${quantityRm} RM of paper. Stock has been updated.`);
            // Clear form
            setSelectedPaper('');
            setSelectedMachine('');
            setJpcNumber('');
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Consume Paper</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{success}</div>}

                    <div>
                        <label htmlFor="paper" className="block text-sm font-medium text-gray-700">Select Paper (Available Stock RM)</label>
                        <select id="paper" value={selectedPaper} onChange={handlePaperChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="">-- Choose a paper --</option>
                            {papers.map(p => (
                                <option key={p.PaperID} value={p.PaperID}>
                                    {p.Manufacturer} - {p.Grade} - {p.Width}mm ({parseFloat(p.StockRM).toFixed(2)} RM) - (Branch: {p.BranchName})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="machine" className="block text-sm font-medium text-gray-700">Select Machine</label>
                        <select id="machine" value={selectedMachine} onChange={(e) => setSelectedMachine(e.target.value)} required disabled={!selectedPaper} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100">
                            <option value="">-- Choose a machine --</option>
                            {filteredMachines.map(m => (
                                <option key={m.MachineID} value={m.MachineID}>{m.Name}</option>
                            ))}
                        </select>
                    </div>

                     <div>
                        <label htmlFor="jpcNumber" className="block text-sm font-medium text-gray-700">JPC Number</label>
                        <input type="text" id="jpcNumber" value={jpcNumber} onChange={(e) => setJpcNumber(e.target.value)} required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>

                    <div>
                        <label htmlFor="quantityRm" className="block text-sm font-medium text-gray-700">Quantity to Consume (RM)</label>
                        <input type="number" id="quantityRm" value={quantityRm} onChange={(e) => setQuantityRm(e.target.value)} required min="0.01" step="0.01" max={selectedPaperDetails?.StockRM} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                         {selectedPaperDetails && <p className="text-xs text-gray-500 mt-1">Available: {parseFloat(selectedPaperDetails.StockRM).toFixed(2)} RM</p>}
                    </div>

                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                        <textarea id="remarks" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"></textarea>
                    </div>

                    <div className="text-right">
                        <button type="submit" disabled={loading || !selectedPaper || !selectedMachine} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                            {loading ? 'Consuming...' : 'Consume Paper'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConsumePaperPage;
