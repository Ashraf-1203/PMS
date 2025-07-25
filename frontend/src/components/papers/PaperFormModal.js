import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import branchService from '../../services/branchService';

const PaperFormModal = ({ isOpen, onClose, onSave, paperToEdit }) => {
    const [formData, setFormData] = useState({
        manufacturer: '',
        grade: '',
        width: '',
        gsm: '',
        rate: '',
        initialStockRm: '0',
        branchId: '',
    });
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = Boolean(paperToEdit);

    useEffect(() => {
        // Fetch branches when modal opens for the first time
        if (isOpen) {
            branchService.getBranches()
                .then(setBranches)
                .catch(err => setError('Failed to load branches.'));
        }
    }, [isOpen]);

    useEffect(() => {
        // Populate form if we are in edit mode
        if (isEditMode && paperToEdit) {
            setFormData({
                manufacturer: paperToEdit.Manufacturer || '',
                grade: paperToEdit.Grade || '',
                // In edit mode, we don't allow changing width, gsm, or branch
                // as it could have cascading effects on stock history.
                // These fields will be disabled.
                width: paperToEdit.Width || '',
                gsm: paperToEdit.GSM || '',
                rate: paperToEdit.Rate || '',
                branchId: paperToEdit.BranchID || '',
                initialStockRm: paperToEdit.StockRM || '0' // Not editable, just for info
            });
        } else {
            // Reset form for add mode
            setFormData({
                manufacturer: '', grade: '', width: '', gsm: '', rate: '',
                initialStockRm: '0', branchId: ''
            });
        }
    }, [paperToEdit, isEditMode, isOpen]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // The onSave prop will handle either create or update logic
            await onSave(formData, paperToEdit?.PaperID);
            onClose(); // Close modal on success
        } catch (err) {
            setError(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    {isEditMode ? 'Edit Paper' : 'Add New Paper'}
                                </Dialog.Title>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    {error && <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">Manufacturer</label>
                                            <input type="text" name="manufacturer" id="manufacturer" value={formData.manufacturer} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
                                            <input type="text" name="grade" id="grade" value={formData.grade} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="width" className="block text-sm font-medium text-gray-700">Width (mm)</label>
                                            <input type="number" name="width" id="width" value={formData.width} onChange={handleChange} required disabled={isEditMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100" />
                                        </div>
                                        <div>
                                            <label htmlFor="gsm" className="block text-sm font-medium text-gray-700">GSM</label>
                                            <input type="number" name="gsm" id="gsm" value={formData.gsm} onChange={handleChange} required disabled={isEditMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100" />
                                        </div>
                                        <div>
                                            <label htmlFor="rate" className="block text-sm font-medium text-gray-700">Rate (per SQM)</label>
                                            <input type="number" step="0.0001" name="rate" id="rate" value={formData.rate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">Branch</label>
                                            <select name="branchId" id="branchId" value={formData.branchId} onChange={handleChange} required disabled={isEditMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100">
                                                <option value="">Select a Branch</option>
                                                {branches.map(branch => (
                                                    <option key={branch.BranchID} value={branch.BranchID}>{branch.BranchName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {!isEditMode && (
                                             <div>
                                                <label htmlFor="initialStockRm" className="block text-sm font-medium text-gray-700">Initial Stock (RM)</label>
                                                <input type="number" step="0.01" name="initialStockRm" id="initialStockRm" value={formData.initialStockRm} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={loading} className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300">
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default PaperFormModal;
