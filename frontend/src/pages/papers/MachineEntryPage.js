import React, { useState, useEffect, useCallback } from 'react';
import machineService from '../../services/machineService';
import MachineFormModal from '../../components/machines/MachineFormModal';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/solid';

const usePermissions = () => {
    const user = JSON.parse(localStorage.getItem('pmsUser'));
    return user?.permissions || {};
};

const MachineEntryPage = () => {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [machineToEdit, setMachineToEdit] = useState(null);

    const permissions = usePermissions();
    const canAdd = permissions.machineEntry?.includes('add');
    const canEdit = permissions.machineEntry?.includes('edit');
    const canDelete = permissions.machineEntry?.includes('delete');

    const fetchMachines = useCallback(async () => {
        try {
            setLoading(true);
            const data = await machineService.getMachines();
            setMachines(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMachines();
    }, [fetchMachines]);

    const handleOpenModal = (machine = null) => {
        setMachineToEdit(machine);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setMachineToEdit(null);
    };

    const handleSaveMachine = async (formData, machineId) => {
        if (machineId) {
            await machineService.updateMachine(machineId, formData);
        } else {
            await machineService.createMachine(formData);
        }
        fetchMachines();
    };

    const handleDeleteMachine = async (machineId) => {
        if (window.confirm('Are you sure you want to deactivate this machine?')) {
            try {
                await machineService.deleteMachine(machineId);
                fetchMachines();
            } catch (err) {
                setError(err.message);
                alert(\`Error: ${err.message}\`);
            }
        }
    };

    if (loading) return <div className="text-center py-10">Loading machines...</div>;
    if (error && !isModalOpen) return <div className="text-red-500 bg-red-100 p-4 rounded-md">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Machine Entry</h1>
                {canAdd && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add New Machine
                    </button>
                )}
            </div>

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {machines.map((machine) => (
                            <tr key={machine.MachineID} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{machine.Name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.BranchName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {canEdit && (
                                        <button onClick={() => handleOpenModal(machine)} className="text-indigo-600 hover:text-indigo-900 mr-3"><PencilIcon className="w-5 h-5" /></button>
                                    )}
                                    {canDelete && (
                                        <button onClick={() => handleDeleteMachine(machine.MachineID)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5" /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {machines.length === 0 && !loading && (
                     <div className="text-center py-8 bg-white"><p className="text-gray-500">No machines found. Click "Add New Machine" to get started.</p></div>
                )}
            </div>

            <MachineFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveMachine}
                machineToEdit={machineToEdit}
            />
        </div>
    );
};

export default MachineEntryPage;
