import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import branchService from '../../services/branchService';

const MachineFormModal = ({ isOpen, onClose, onSave, machineToEdit }) => {
    const [name, setName] = useState('');
    const [branchId, setBranchId] = useState('');
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = Boolean(machineToEdit);

    useEffect(() => {
        if (isOpen) {
            branchService.getBranches()
                .then(setBranches)
                .catch(err => setError('Failed to load branches.'));

            if (isEditMode && machineToEdit) {
                setName(machineToEdit.Name || '');
                setBranchId(machineToEdit.BranchID || '');
            } else {
                setName('');
                setBranchId('');
            }
            setError('');
        }
    }, [machineToEdit, isEditMode, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onSave({ name, branchId }, machineToEdit?.MachineID);
            onClose();
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    {isEditMode ? 'Edit Machine' : 'Add New Machine'}
                                </Dialog.Title>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    {error && <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Machine Name</label>
                                        <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">Branch</label>
                                        <select name="branchId" id="branchId" value={branchId} onChange={(e) => setBranchId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                            <option value="">Select a Branch</option>
                                            {branches.map(branch => (
                                                <option key={branch.BranchID} value={branch.BranchID}>{branch.BranchName}</option>
                                            ))}
                                        </select>
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

export default MachineFormModal;
