import React, { useState, useEffect, useCallback } from 'react';
import branchService from '../../services/branchService';
import BranchFormModal from '../../components/branches/BranchFormModal';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/solid';

const usePermissions = () => {
    const user = JSON.parse(localStorage.getItem('pmsUser'));
    return user?.permissions || {};
};

const BranchListPage = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [branchToEdit, setBranchToEdit] = useState(null);

    const permissions = usePermissions();
    const canAdd = permissions.branchList?.includes('add');
    const canEdit = permissions.branchList?.includes('edit');
    const canDelete = permissions.branchList?.includes('delete');

    const fetchBranches = useCallback(async () => {
        try {
            setLoading(true);
            const data = await branchService.getAllBranchesForAdmin();
            setBranches(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const handleOpenModal = (branch = null) => {
        setBranchToEdit(branch);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setBranchToEdit(null);
    };

    const handleSaveBranch = async (formData, branchId) => {
        if (branchId) {
            await branchService.updateBranch(branchId, formData);
        } else {
            await branchService.createBranch(formData);
        }
        fetchBranches();
    };

    const handleDeleteBranch = async (branchId) => {
        if (window.confirm('Are you sure you want to deactivate this branch? This can only be done if it is not in use.')) {
            try {
                await branchService.deleteBranch(branchId);
                fetchBranches();
            } catch (err) {
                setError(err.message);
                alert(\`Error: ${err.message}\`);
            }
        }
    };

    if (loading) return <div className="text-center py-10">Loading branches...</div>;
    if (error && !isModalOpen) return <div className="text-red-500 bg-red-100 p-4 rounded-md">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Branch Management</h1>
                {canAdd && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add New Branch
                    </button>
                )}
            </div>

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {branches.map((branch) => (
                            <tr key={branch.BranchID} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{branch.BranchName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{branch.Location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${branch.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {branch.IsActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {canEdit && (
                                        <button onClick={() => handleOpenModal(branch)} className="text-indigo-600 hover:text-indigo-900 mr-3"><PencilIcon className="w-5 h-5" /></button>
                                    )}
                                    {canDelete && branch.IsActive && (
                                        <button onClick={() => handleDeleteBranch(branch.BranchID)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5" /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {branches.length === 0 && !loading && (
                     <div className="text-center py-8 bg-white"><p className="text-gray-500">No branches found. Click "Add New Branch" to get started.</p></div>
                )}
            </div>

            <BranchFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveBranch}
                branchToEdit={branchToEdit}
            />
        </div>
    );
};

export default BranchListPage;
